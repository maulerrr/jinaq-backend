from app.core.models.users_model import User
from app.core.models.universities_models import Institution


def serialize_user_profile(user: User) -> dict:
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "username": user.username,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "interests": user.interests,
        "academic_info": {
            "gpa": user.academic_info.gpa,
            "sat": user.academic_info.sat,
            "ielts": user.academic_info.ielts,
            "toefl": user.academic_info.toefl,
        }
        if user.academic_info
        else None,
        "language_proficiencies": [
            {"language": prof.language, "level": prof.level.value}
            for prof in user.language_proficiencies
        ],
    }


def serialize_institution(institution: Institution) -> dict:
    return {
        "name": institution.name,
        "short_name": institution.short_name,
        "description": institution.description,
        "foundation_year": institution.foundation_year,
        "financing_type": institution.financing_type.value,
        "type": institution.type.value,
        "website": institution.website,
        "email": institution.email,
        "contact_number": institution.contact_number,
        "city": institution.city.name,
        "country": institution.country.name,
        "address": institution.address,
        "has_dorm": institution.has_dorm,
        "image_url": institution.image_url,
        "majors": [
            {
                "name": major.name,
                "duration_years": major.duration_years,
                "learning_language": major.learning_language,
                "description": major.description,
                "price": major.price,
                "category": major.category.value,
            }
            for major in institution.majors
        ],
        "enrollment_documents": [doc.name for doc in institution.enrollment_documents],
        "enrollment_requirements": [
            {
                "name": req.name,
                "type": req.type.value,
                "value": req.value,
            }
            for req in institution.enrollment_requirements
        ],
    }
