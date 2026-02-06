from fastapi import APIRouter, UploadFile, File, Form
from pathlib import Path
from app.services.skin_tone import detect_skin_tone
from app.services.ai_recommendation import get_style_recommendation
from PIL import Image
import uuid

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    gender: str = Form(...),
    occasion: str = Form(...),
    region: str = Form(...)
):
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    try:
        img = Image.open(file_path)
        img.verify()
    except Exception:
        file_path.unlink(missing_ok=True)
        return {"error": "Invalid image file"}

    skin_data = detect_skin_tone(str(file_path))

    ai_data = get_style_recommendation(skin_data, gender, occasion, region)

    return {
        "message": "Upload successful",
        "filename": str(file_path),
        "analysis": {
            "skin": skin_data,
            "style_recommendation": ai_data
        }
    }
