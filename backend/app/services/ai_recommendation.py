import os
import json
import google.generativeai as genai

def get_style_recommendation(skin_data, gender, occasion, region):

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {
            "warning": "AI enhancement disabled. Add API key.",
            "recommendations": None
        }

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    You are a professional fashion stylist.

    Skin depth: {skin_data['depth']}
    Undertone: {skin_data['undertone']}
    RGB: {skin_data['rgb']}
    Gender: {gender}

    Occasion: {occasion}
    Region: {region}
    Make recommendations appropriate to the specified gender.
    Return STRICT JSON only:
    {{
        "recommended_colors": [],
        "outfit_suggestions": {{
            "top": "",
            "bottom": "",
            "footwear": ""
        }},
        "accessories": [],
        "explanation": ""
    }}
    """

    try:
        # 🔥 THIS WAS MISSING
        response = model.generate_content(prompt)

        text_output = response.text.strip()

        # Remove markdown formatting if present
        if text_output.startswith("```"):
            text_output = text_output.split("```")[1]
            if text_output.startswith("json"):
                text_output = text_output[4:]
            text_output = text_output.strip()

        parsed = json.loads(text_output)

        return parsed

    except Exception as e:
        return {
            "error": "AI parsing failed",
            "details": str(e)
        }
