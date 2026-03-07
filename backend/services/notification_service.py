from datetime import datetime
from services.email_service import send_email

def send_comment_notification(background_tasks, post, post_owner, actor):
    subject = "New Comment on Your Post"

    body = f"""
Post: "{post.title}"
User: {actor.username}
Activity: Commented on your post
Time: {datetime.utcnow().strftime("%Y-%m-%d %I:%M %p")}
"""

    background_tasks.add_task(
        send_email,
        post_owner.email,
        subject,
        body
    )


def send_like_notification(background_tasks, post, post_owner, actor):
    subject = "New Like on Your Post"

    body = f"""
Post: "{post.title}"
User: {actor.username}
Activity: Liked your post
Time: {datetime.utcnow().strftime("%Y-%m-%d %I:%M %p")}
"""

    background_tasks.add_task(
        send_email,
        post_owner.email,
        subject,
        body
    )