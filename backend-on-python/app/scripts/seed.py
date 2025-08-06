import asyncio
import random
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[2]))
from faker import Faker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import config
from app.core.models import (
    Country, City, User, UserRole, SubscriptionType, Organization,
    OrganizationSubscriptionType, OrganizationUser, OrganizationUserRole,
    OrganizationGroup, Post, Comment, PostLike, Professions, Test, Question,
    Answer, TestSubmission, TestSubmissionStatus, TestSubmissionQuestion,
    PersonalityAnalysis, PersonalityAnalysisMbti, PersonalityAnalysisProfessions,
    PersonalityAnalysisMajors, PersonalityAnalysisAttributes,
    PersonalityAnalysisAttributeType, Institution, InstitutionMajor,
    InstitutionEnrollmentDocument, InstitutionEnrollmentRequirement,

    InstitutionFinancingType, InstitutionType, EnrollmentRequirementType,
    InstitutionMajorCategory,
    UniversitiesAnalysis, UniversitiesAnalysisInstitutes,
    UniversitiesAnalysisResultsAttributes, UniversitiesAnalysisResultsPlan,
    AttributeType,
    UserAcademic, UserLanguageProficiency, LanguageLevel, InterestsEnum
)
from app.core.security.password import hash_password

fake = Faker()

# Database connection
DB_URL = f"postgresql://{config.Database.username}:{config.Database.password}@{config.Database.hostname}:{config.Database.port}/{config.Database.db}"
engine = create_async_engine(DB_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

async def seed_data():
    async with AsyncSessionLocal() as session:
        # Clean up existing data
        await session.execute(UserLanguageProficiency.__table__.delete())
        await session.execute(UserAcademic.__table__.delete())
        await session.execute(UniversitiesAnalysisResultsPlan.__table__.delete())
        await session.execute(UniversitiesAnalysisResultsAttributes.__table__.delete())
        await session.execute(UniversitiesAnalysisInstitutes.__table__.delete())
        await session.execute(UniversitiesAnalysis.__table__.delete())
        await session.execute(InstitutionEnrollmentRequirement.__table__.delete())
        await session.execute(InstitutionEnrollmentDocument.__table__.delete())
        await session.execute(InstitutionMajor.__table__.delete())
        await session.execute(Institution.__table__.delete())
        await session.execute(PersonalityAnalysisAttributes.__table__.delete())
        await session.execute(PersonalityAnalysisMajors.__table__.delete())
        await session.execute(PersonalityAnalysisProfessions.__table__.delete())
        await session.execute(PersonalityAnalysisMbti.__table__.delete())
        await session.execute(PersonalityAnalysis.__table__.delete())
        await session.execute(TestSubmissionQuestion.__table__.delete())
        await session.execute(TestSubmission.__table__.delete())
        await session.execute(Answer.__table__.delete())
        await session.execute(Question.__table__.delete())
        await session.execute(Test.__table__.delete())
        await session.execute(Professions.__table__.delete())
        await session.execute(PostLike.__table__.delete())
        await session.execute(Comment.__table__.delete())
        await session.execute(Post.__table__.delete())
        await session.execute(OrganizationUser.__table__.delete())
        await session.execute(OrganizationGroup.__table__.delete())
        await session.execute(Organization.__table__.delete())
        await session.execute(User.__table__.delete())
        await session.execute(City.__table__.delete())
        await session.execute(Country.__table__.delete())
        await session.commit()

        # --- Countries ---
        countries = []
        for _ in range(10):
            country = Country(name=fake.country(), emoji=fake.emoji())
            countries.append(country)
        session.add_all(countries)
        await session.commit()

        # --- Cities ---
        cities = []
        for country in countries:
            for _ in range(5):
                city = City(name=fake.city(), country_id=country.id)
                cities.append(city)
        session.add_all(cities)
        await session.commit()

        # --- Users ---
        users = []
        for _ in range(50):
            user = User(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.unique.email(),
                username=fake.unique.user_name(),
                password=hash_password("password"),
                role=random.choice(list(UserRole)),
                subscription=random.choice(list(SubscriptionType)),
                city_id=random.choice(cities).id,
                interests=random.sample(list(InterestsEnum), k=random.randint(1, 5))
            )
            users.append(user)
        session.add_all(users)
        await session.commit()

        # --- Organizations ---
        organizations = []
        for _ in range(10):
            organization = Organization(
                name=fake.company(),
                short_name=fake.company_suffix(),
                email=fake.company_email(),
                subscription=random.choice(list(OrganizationSubscriptionType))
            )
            organizations.append(organization)
        session.add_all(organizations)
        await session.commit()

        # --- Organization Groups ---
        org_groups = []
        for org in organizations:
            for i in range(3):
                group = OrganizationGroup(organization_id=org.id, name=f"Group {i+1}")
                org_groups.append(group)
        session.add_all(org_groups)
        await session.commit()

        # --- Organization Users ---
        org_users = []
        for user in users:
            org = random.choice(organizations)
            group = random.choice([g for g in org_groups if g.organization_id == org.id])
            org_user = OrganizationUser(
                user_id=user.id,
                organization_id=org.id,
                role=random.choice(list(OrganizationUserRole)),
                group_id=group.id
            )
            org_users.append(org_user)
        session.add_all(org_users)
        await session.commit()

        # --- Posts, Comments, Likes ---
        posts = []
        for user in users:
            for _ in range(random.randint(0, 5)):
                post = Post(
                    author_id=user.id,
                    content=fake.text(max_nb_chars=500),
                    tags=[fake.word() for _ in range(random.randint(1, 4))],
                    mentions=[random.choice(users).username for _ in range(random.randint(0, 2))]
                )
                posts.append(post)
        session.add_all(posts)
        await session.commit()

        comments = []
        likes = []
        for post in posts:
            # Comments
            for _ in range(random.randint(0, 10)):
                comment = Comment(
                    post_id=post.id,
                    user_id=random.choice(users).id,
                    content=fake.text(max_nb_chars=200)
                )
                comments.append(comment)
            # Likes
            for user in random.sample(users, random.randint(0, len(users))):
                 like = PostLike(post_id=post.id, user_id=user.id)
                 likes.append(like)
        session.add_all(comments)
        session.add_all(likes)
        await session.commit()

        # --- Professions ---
        professions = []
        for _ in range(20):
            profession = Professions(
                name=fake.job(),
                category=fake.word(),
                description=fake.text(),
                start_salary=random.uniform(30000, 60000),
                end_salary=random.uniform(60000, 120000),
                popularity=random.choice(["LOW", "MEDIUM", "HIGH"]),
                skills=", ".join(fake.words(nb=5))
            )
            professions.append(profession)
        session.add_all(professions)
        await session.commit()

        # --- Tests, Questions, Answers ---
        tests = []
        for _ in range(5):
            test = Test(
                name=f"Test: {fake.sentence(nb_words=3)}",
                description=fake.text(),
                tags=[fake.word() for _ in range(3)],
                estimated_time_minutes=random.randint(10, 60)
            )
            tests.append(test)
        session.add_all(tests)
        await session.commit()

        questions = []
        answers = []
        for test in tests:
            for i in range(10):
                question = Question(
                    test_id=test.id,
                    question=f"Question {i+1}: {fake.sentence()}",
                    order=i + 1
                )
                questions.append(question)
        session.add_all(questions)
        await session.commit()

        for question in questions:
            is_multi_choice = random.choice([True, False])
            correct_answers_count = 1 if not is_multi_choice else random.randint(1, 2)
            
            for i in range(4):
                is_correct = i < correct_answers_count
                answer = Answer(
                    question_id=question.id,
                    answer=f"Answer {i+1}: {fake.sentence()}",
                    is_correct=is_correct
                )
                answers.append(answer)
        session.add_all(answers)
        await session.commit()

        # --- Institutions ---
        institutions = []
        for _ in range(20):
            institution = Institution(
                name=fake.company() + " University",
                short_name=fake.company_suffix(),
                description=fake.text(),
                foundation_year=str(fake.year()),
                financing_type=random.choice(list(InstitutionFinancingType)),
                type=random.choice(list(InstitutionType)),
                website=fake.url(),
                email=fake.email(),
                contact_number=fake.phone_number(),
                city_id=random.choice(cities).id,
                country_id=random.choice(countries).id,
                address=fake.address(),
                has_dorm=fake.boolean(),
                image_url=fake.image_url()
            )
            institutions.append(institution)
        session.add_all(institutions)
        await session.commit()

        print("Seed data has been created successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
