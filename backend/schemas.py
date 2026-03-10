from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class LoginSchema(BaseModel):
    email: str
    password: str


class PostCreate(BaseModel):
    title: str
    content: str


class CommentCreate(BaseModel):
    text: str

from typing import Optional

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    images: Optional[List[str]] = []   

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True