

from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime,Float,Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import uuid
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
IST = ZoneInfo("Asia/Kolkata")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password = Column(String)
    mobile = Column(String, nullable=True)
    address = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
   


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    images = Column(Text, nullable=True)  
    user = relationship("User") 
    views = Column(Integer, default=0)
     
    status = Column(String, default="published")  
    scheduled_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class PostView(Base):
    __tablename__ = "post_views"
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)  # Basic, Premium, Pro
    price = Column(Float)

    max_posts = Column(Integer)
    max_images_per_post = Column(Integer)
    max_likes = Column(Integer)
    max_comments = Column(Integer)

class BillingHistory(Base):
    __tablename__ = "billing_history"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"))

    transaction_id = Column(String, default=lambda: str(uuid.uuid4()))
    amount = Column(Float)

    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)

    invoice_path = Column(String)
    
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    type = Column(String)  # like, comment, subscription
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="notifications")    

class AIChat(Base):
    __tablename__ = "ai_chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")))

    user = relationship("User")

class ChatActivity(Base):
    __tablename__ = "chat_activity"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    question = Column(Text)

    ai_response = Column(Text)

    timestamp = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Kolkata")))
