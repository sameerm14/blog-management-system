from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Query, Session
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
import models, schemas
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
import shutil, os
from reportlab.lib.pagesizes import A4
from typing import List,Optional
from fastapi import Query, Form
from math import ceil
from database import engine, Base
from fastapi import UploadFile, File
from fastapi.staticfiles import StaticFiles
from auth import (
    get_db,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
import uuid
from datetime import datetime, timedelta
from services.notification_service import send_comment_notification
from services.notification_service import send_like_notification
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
app.mount("/media", StaticFiles(directory="media"), name="media")
MEDIA_DIR = "media/posts"
os.makedirs(MEDIA_DIR, exist_ok=True)

INVOICE_DIR = "media/invoices"
os.makedirs(INVOICE_DIR, exist_ok=True)


PROFILE_DIR = "media/profile"
os.makedirs(PROFILE_DIR, exist_ok=True)

@app.post("/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}


@app.post("/auth/login")
def login(data: schemas.LoginSchema, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": user.id})

    return {"access_token": token}


def get_active_plan(user, db):
    billing = db.query(models.BillingHistory).filter(
        models.BillingHistory.user_id == user.id
    ).order_by(models.BillingHistory.id.desc()).first()

    if not billing:
        raise HTTPException(
            403,
            "You’ve reached your plan limit. Kindly upgrade your plan to continue."
        )

    return db.query(models.SubscriptionPlan).filter(
        models.SubscriptionPlan.id == billing.plan_id
    ).first()



@app.put("/profile")
def update_profile(
    mobile: str = Form(None),
    address: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    db_user = db.query(models.User).filter(
        models.User.id == user.id
    ).first()

    if mobile:
        db_user.mobile = mobile

    if address:
        db_user.address = address

    if image:
        file_location = os.path.join(PROFILE_DIR, image.filename)
        with open(file_location, "wb") as f:
            shutil.copyfileobj(image.file, f)

        db_user.profile_image = f"/{file_location}"

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated",
        "mobile": db_user.mobile,
        "address": db_user.address,
        "profile_image": db_user.profile_image
    }

@app.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    db_user = db.query(models.User).filter(
        models.User.id == user.id
    ).first()

    return db_user

@app.post("/posts", response_model=schemas.PostOut)
def create_post(
    title: str = Form(...),
    content: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),   
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    plan = get_active_plan(user, db)

    post_count = db.query(models.Post).filter(
        models.Post.author_id == user.id
    ).count()

    if post_count >= plan.max_posts:
        raise HTTPException(
            403,
            "You’ve reached your plan limit. Kindly upgrade your plan to continue."
        )

  
    if images:
        if len(images) > plan.max_images_per_post:
            raise HTTPException(
                403,
                "You’ve reached your plan limit. Kindly upgrade your plan to continue."
            )

    image_paths = []

    if images:
        for image in images:
            file_location = os.path.join(MEDIA_DIR, image.filename)
            with open(file_location, "wb") as f:
                shutil.copyfileobj(image.file, f)
            image_paths.append(f"/{file_location}")

    new_post = models.Post(
        title=title,
        content=content,
        author_id=user.id,
        images=",".join(image_paths) if image_paths else None
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return schemas.PostOut(
    id=new_post.id,
    title=new_post.title,
    content=new_post.content,
    author_id=new_post.author_id,
    created_at=new_post.created_at,
    images=new_post.images.split(",") if new_post.images else []
)
@app.get("/subscription/check")
def check_subscription(db: Session = Depends(get_db), user = Depends(get_current_user)):
    plan = get_active_plan(user, db)  # will raise 403 if no plan
    return {"plan": plan.name, "max_posts": plan.max_posts}

@app.get("/posts")
def get_posts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),      
    limit: int = Query(10, ge=1),     
    search: str = Query(None)           
):
    query = db.query(models.Post)

    if search:
        query = query.filter(
            (models.Post.title.ilike(f"%{search}%")) |
            (models.Post.content.ilike(f"%{search}%"))
        )

    total = query.count()
    total_pages = ceil(total / limit)
    posts = query.offset((page - 1) * limit).limit(limit).all()

    # Transform posts: split images string into list
    result = []
    for post in posts:
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "author_id": post.author_id,
            "author_username": post.user.username,
            "created_at": post.created_at,
            "images": post.images.split(",") if post.images else []
        })

    return {
        "total": total,
        "total_pages": total_pages,
        "page": page,
        "limit": limit,
        "posts": result
    }


from fastapi import UploadFile, File

@app.put("/posts/{post_id}", response_model=schemas.PostOut)
def update_post(
    post_id: int,
    title: str = Form(...),          
    content: str = Form(...),
    image: UploadFile = File(None), 
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(404, "Post not found")
    if db_post.author_id != user.id:
        raise HTTPException(403, "Not allowed")

    
    db_post.title = title
    db_post.content = content

   
    if image:
        os.makedirs(MEDIA_DIR, exist_ok=True)
        file_location = os.path.join(MEDIA_DIR, image.filename)
        with open(file_location, "wb") as f:
            shutil.copyfileobj(image.file, f)
        db_post.image = f"/{file_location}"

    db.commit()
    db.refresh(db_post)
    return db_post


@app.delete("/posts/{post_id}")
def delete_post(post_id: int,
                db: Session = Depends(get_db),
                user = Depends(get_current_user)):

    db_post = db.query(models.Post).filter(
        models.Post.id == post_id
    ).first()

    if not db_post:
        raise HTTPException(404, "Post not found")

    if db_post.author_id != user.id:
        raise HTTPException(403, "Not allowed")

    db.delete(db_post)
    db.commit()

    return {"message": "Post deleted"}


@app.get("/posts/mine")
def my_posts(db: Session = Depends(get_db),
             user = Depends(get_current_user)):

    posts = db.query(models.Post).filter(models.Post.author_id == user.id).all()

    result = []
    for post in posts:
        images_list = post.images.split(",") if post.images else []
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "author_id": post.author_id,
            "created_at": post.created_at,
            "images": images_list
        })
    return result

@app.post("/posts/{post_id}/comment")
def comment_on_post(post_id: int,
                    comment: schemas.CommentCreate,
                    background_tasks: BackgroundTasks,
                    db: Session = Depends(get_db),
                    user = Depends(get_current_user)):

    post = db.query(models.Post).filter(
        models.Post.id == post_id
    ).first()

    if not post:
        raise HTTPException(404, "Post not found")

    plan = get_active_plan(user, db)

    comment_count = db.query(models.Comment).filter(
        models.Comment.user_id == user.id
    ).count()

    if comment_count >= plan.max_comments:
        raise HTTPException(
            403,
            "You’ve reached your plan limit.  you can not comment on more posts."
        )

    new_comment = models.Comment(
        post_id=post_id,
        user_id=user.id,
        text=comment.text
    )
    db.add(new_comment)

    # ✅ Increment views if user hasn't viewed yet
    existing_view = db.query(models.PostView).filter_by(
        post_id=post_id, user_id=user.id
    ).first()
    if not existing_view:
        db.add(models.PostView(post_id=post_id, user_id=user.id))
        post.views = (post.views or 0) + 1

    db.commit()

    post_owner = db.query(models.User).filter(
        models.User.id == post.author_id
    ).first()

    send_comment_notification(background_tasks, post, post_owner, user)

    return {"message": "Comment added", "views": post.views}


@app.post("/posts/{post_id}/like")
def like_post(post_id: int,
              background_tasks: BackgroundTasks,
              db: Session = Depends(get_db),
              user = Depends(get_current_user)):

    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found") 

    plan = get_active_plan(user, db) 

    like_count = db.query(models.Like).filter(
        models.Like.user_id == user.id
    ).count()
    if like_count >= plan.max_likes:
        raise HTTPException(
            403,
            "You’ve reached your plan limit. You cannot like more posts."
        )

    # Check if user already liked
    existing_like = db.query(models.Like).filter_by(
        post_id=post_id, user_id=user.id
    ).first()
    if existing_like:
        return {"message": "Already liked"}

    new_like = models.Like(
        post_id=post_id,
        user_id=user.id
    )
    db.add(new_like)

    # ✅ Increment views if user hasn't viewed yet
    existing_view = db.query(models.PostView).filter_by(
        post_id=post_id, user_id=user.id
    ).first()
    if not existing_view:
        db.add(models.PostView(post_id=post_id, user_id=user.id))
        post.views = (post.views or 0) + 1

    db.commit()
   
    total_post_likes = db.query(models.Like).filter(
        models.Like.post_id == post_id
    ).count()

    post_owner = db.query(models.User).filter(
        models.User.id == post.author_id
    ).first()

    send_like_notification(background_tasks, post, post_owner, user)

    return {
        "message": "Liked",
        "total_post_likes": total_post_likes,
        "views": post.views
    }

@app.on_event("startup")
def create_default_plans():
    db = next(get_db())

    if not db.query(models.SubscriptionPlan).first():
        plans = [
            models.SubscriptionPlan(
                name="Basic",
                price=300,
                max_posts=1,
                max_images_per_post=1,
                max_likes=5,
                max_comments=5
            ),
            models.SubscriptionPlan(
                name="Premium",
                price=749,
                max_posts=2,
                max_images_per_post=2,
                max_likes=20,
                max_comments=20
            ),
            models.SubscriptionPlan(
                name="Pro",
                price=1299,
                max_posts=9999,
                max_images_per_post=9999,
                max_likes=9999,
                max_comments=9999
            )
        ]

        db.add_all(plans)
        db.commit()

def generate_invoice(user, plan, start_date, end_date):
    transaction_id = str(uuid.uuid4())
    file_path = f"{INVOICE_DIR}/invoice_{user.id}_{transaction_id}.pdf"

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=60,
        bottomMargin=40
    )

    elements = []
    styles = getSampleStyleSheet()

    normal_style = styles["Normal"]
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=colors.HexColor("#2E4053"),
    )

    bold_style = styles["Heading1"]
    user_name_style = ParagraphStyle(
        'UserNameStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#2C3E50"),
        alignment=TA_LEFT
    )

   
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.25 * inch))

    invoice_date = datetime.now().strftime("%Y-%m-%d")

    header_data = [
        ["Invoice No:", transaction_id],
        ["Invoice Date:", invoice_date],
    ]

    header_table = Table(header_data, colWidths=[2*inch, 4*inch])
    header_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 0.3 * inch))

   
    bill_to_data = [
        [Paragraph("<b>Bill To:</b>", bold_style), Paragraph(f"{user.username}", user_name_style)]
    ]

    bill_to_table = Table(bill_to_data, colWidths=[1.5*inch, 4.5*inch])
    bill_to_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),  
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))

    elements.append(bill_to_table)
    elements.append(Spacer(1, 0.3 * inch))

   
    price_value = f"Rs. {plan.price:.2f}"  

    data = [
        ["Description", "Details"],
        ["Subscription Plan", plan.name],
        ["Subscription Period", f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"],
        ["Amount", price_value],
    ]

    table = Table(data, colWidths=[3*inch, 3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2E86C1")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
        ('BACKGROUND', (0,1), (-1,-1), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 0.5 * inch))

   
    elements.append(Paragraph(
        "Thank you for subscribing to our Blog Management Service. "
        "This invoice confirms your successful payment and active subscription.",
        normal_style
    ))

    elements.append(Spacer(1, 0.2 * inch))

    elements.append(Paragraph(
        "For any support or queries, please contact our support team.",
        normal_style
    ))

    doc.build(elements)

    return file_path, transaction_id
@app.get("/dashboard/notifications")
def get_post_interactions(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # Get all posts by this user
    posts = db.query(models.Post).filter(models.Post.author_id == user.id).all()
    interactions = []

    for post in posts:
        # Get likes
        likes = db.query(models.Like).filter(models.Like.post_id == post.id).all()
        # Get comments
        comments = db.query(models.Comment).filter(models.Comment.post_id == post.id).all()

        # Include the user names for likes and comments
        likes_data = []
        for l in likes:
            liker = db.query(models.User).filter(models.User.id == l.user_id).first()
            likes_data.append({
                "user_id": l.user_id,
                "user_name": liker.username if liker else "Unknown"
            })

        comments_data = []
        for c in comments:
            commenter = db.query(models.User).filter(models.User.id == c.user_id).first()
            comments_data.append({
                "user_id": c.user_id,
                "user_name": commenter.username if commenter else "Unknown",
                "text": c.text
            })

        interactions.append({
            "post_id": post.id,
            "post_title": post.title,
            "likes": likes_data,
            "comments": comments_data
        })

    return interactions

@app.post("/subscribe/{plan_name}")
def subscribe(plan_name: str,
              db: Session = Depends(get_db),
              user = Depends(get_current_user)):

    plan = db.query(models.SubscriptionPlan).filter(
        models.SubscriptionPlan.name == plan_name
    ).first()

    if not plan:
        raise HTTPException(404, "Plan not found")

    # Check for existing active subscription
    active_billing = db.query(models.BillingHistory).filter(
        models.BillingHistory.user_id == user.id,
        models.BillingHistory.end_date >= datetime.utcnow()  # still active
    ).order_by(models.BillingHistory.end_date.desc()).first()

    if active_billing:
        raise HTTPException(
            403,
            "You have an active subscription. Please wait until it expires to choose a new plan."
        )

    # If no active subscription, create new subscription
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=30)

    invoice_path, transaction_id = generate_invoice(
        user, plan, start_date, end_date
    )

    billing = models.BillingHistory(
        user_id=user.id,
        plan_id=plan.id,
        amount=plan.price,
        start_date=start_date,
        end_date=end_date,
        invoice_path=invoice_path,
        transaction_id=transaction_id
    )

    db.add(billing)
    db.commit()

    return {
        "message": f"🎉 Congrats! You have subscribed to {plan.name} plan.",
        "invoice": invoice_path
    }

@app.get("/my-invoices")
def get_my_invoices(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    invoices = db.query(models.BillingHistory).filter(
        models.BillingHistory.user_id == user.id
    ).all()

    result = []

    for inv in invoices:
        result.append({
            "plan": inv.plan_id,
            "amount": inv.amount,
            "start_date": inv.start_date,
            "end_date": inv.end_date,
            "invoice": inv.invoice_path
        })

    return result

@app.get("/admin/users")
def get_users(admin_key: str, db: Session = Depends(get_db)):
    if admin_key != "supersecret123":  # simple password
        raise HTTPException(401, "Unauthorized")
    users = db.query(models.User).all()
    # Return only safe info
    return [{"id": u.id, "username": u.username, "email": u.email, "mobile": u.mobile} for u in users]


@app.get("/user/dashboard")
def user_dashboard(db: Session = Depends(get_db), user = Depends(get_current_user)):

    # Total posts
    total_posts = db.query(models.Post).filter(models.Post.author_id == user.id).count()

    # Total comments made by user
    total_comments_made = db.query(models.Comment).filter(models.Comment.user_id == user.id).count()

    # Total likes received on user's posts
    user_posts = db.query(models.Post).filter(models.Post.author_id == user.id).all()
    total_likes_received = sum(
        db.query(models.Like).filter(models.Like.post_id == post.id).count() for post in user_posts
    )

    # Optional: total views (if Post has a 'views' column)
    total_views = sum(post.views if hasattr(post, "views") else 0 for post in user_posts)

    # Likes/comments per post
    posts_data = []
    for post in user_posts:
        likes_count = db.query(models.Like).filter(models.Like.post_id == post.id).count()
        comments_count = db.query(models.Comment).filter(models.Comment.post_id == post.id).count()
        posts_data.append({
            "post_id": post.id,
            "title": post.title,
            "likes": likes_count,
            "comments": comments_count
        })

    return {
        "total_posts": total_posts,
        "total_comments_made": total_comments_made,
        "total_likes_received": total_likes_received,
        "total_views": total_views,
        "posts": posts_data
    }
@app.get("/posts/{post_id}")
def view_post(post_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")

    # Check if this user has already viewed this post
    existing_view = db.query(models.PostView).filter_by(post_id=post_id, user_id=user.id).first()
    if not existing_view:
        new_view = models.PostView(post_id=post_id, user_id=user.id)
        db.add(new_view)
        post.views = (post.views or 0) + 1  # increment total views
        db.commit()
        db.refresh(post)

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "images": post.images.split(",") if post.images else [],
        "views": post.views
    }