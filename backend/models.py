from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime,Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import uuid

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



class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
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
    