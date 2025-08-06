-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('USER', 'SUPERADMIN', 'MINISTRY');

-- CreateEnum
CREATE TYPE "subscription_type_enum" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "language_level_enum" AS ENUM ('NATIVE', 'FLUENT', 'BEGINNER');

-- CreateEnum
CREATE TYPE "interests_enum" AS ENUM ('MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'COMPUTER_SCIENCE', 'HISTORY', 'GEOGRAPHY', 'LITERATURE', 'LANGUAGES', 'ART', 'MUSIC', 'SPORTS', 'ECONOMICS', 'PSYCHOLOGY', 'MEDICINE', 'ENGINEERING', 'BUSINESS', 'DESIGN', 'AI_MACHINE_LEARNING', 'DATA_SCIENCE', 'CYBERSECURITY', 'GAME_DEVELOPMENT', 'DIGITAL_CONTENT_CREATION', 'E_SPORTS', 'ROBOTICS', 'GRAPHIC_DESIGN', 'FASHION', 'ENTREPRENEURSHIP', 'ENVIRONMENTAL_STUDIES', 'MENTAL_WELLBEING', 'FINANCE', 'COOKING', 'TRAVEL');

-- CreateEnum
CREATE TYPE "MAJOR_CATEGORY" AS ENUM ('INFORMATION_TECHNOLOGY', 'ENGINEERING', 'NATURAL_SCIENCES', 'SOCIAL_SCIENCES', 'HUMANITIES', 'BUSINESS_ADMINISTRATION', 'HEALTH_MEDICINE', 'ARTS_DESIGN', 'EDUCATION', 'LAW', 'AGRICULTURE', 'ENVIRONMENTAL_STUDIES', 'MATHEMATICS', 'STATISTICS', 'PSYCHOLOGY', 'ECONOMICS', 'POLITICAL_SCIENCE', 'HISTORY', 'PHILOSOPHY', 'LINGUISTICS', 'COMMUNICATION', 'MEDIA_STUDIES', 'ARCHITECTURE', 'MUSIC', 'FILM_THEATER', 'DANCE', 'VISUAL_ARTS', 'FINE_ARTS', 'GRAPHIC_DESIGN', 'INTERIOR_DESIGN', 'INDUSTRIAL_DESIGN', 'FASHION_DESIGN', 'PRODUCT_DESIGN', 'JEWELRY_DESIGN', 'TEXTILE_DESIGN', 'ANIMATION', 'GAME_DESIGN', 'DIGITAL_ART', 'CREATIVE_WRITING', 'JOURNALISM', 'PUBLIC_RELATIONS', 'ADVERTISING', 'MARKETING');

-- CreateEnum
CREATE TYPE "profession_category_enum" AS ENUM ('TECHNOLOGY', 'MEDICINE', 'EDUCATION', 'FINANCE', 'ENGINEERING', 'ARTS', 'BUSINESS', 'LAW', 'SCIENCE', 'SOCIAL_SCIENCES', 'GOVERNMENT', 'AGRICULTURE');

-- CreateEnum
CREATE TYPE "organization_subscription_type_enum" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "organization_user_role_enum" AS ENUM ('STUDYING', 'GRADUATED', 'STAFF', 'STUDENT');

-- CreateEnum
CREATE TYPE "TestSubmissionStatus" AS ENUM ('COMPLETED', 'ACTIVE', 'NOT_STARTED');

-- CreateEnum
CREATE TYPE "PersonalityAnalysisAttributeType" AS ENUM ('PROS', 'CONS');

-- CreateEnum
CREATE TYPE "popularity_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InstitutionMajorCategory" AS ENUM ('STEM', 'BUSINESS', 'ARTS', 'HUMANITIES', 'MEDICINE', 'LAW', 'OTHER');

-- CreateEnum
CREATE TYPE "InstitutionFinancingType" AS ENUM ('PRIVATE', 'GOV', 'AUTONOMOUS');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('SCHOOL', 'COLLEGE', 'UNIVERSITY');

-- CreateEnum
CREATE TYPE "EnrollmentRequirementType" AS ENUM ('ACADEMIC', 'LANGUAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('PROS', 'CONS');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('RECRUITMENT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('OWNER', 'MAINTAINER', 'MEMBER', 'CANDIDATE');

-- CreateEnum
CREATE TYPE "RoadmapType" AS ENUM ('ENROLLMENT', 'EMPLOYMENT');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "user_role_enum" NOT NULL DEFAULT 'USER',
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "date_of_birth" TIMESTAMPTZ(6),
    "subscription" "subscription_type_enum" NOT NULL DEFAULT 'FREE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "organization_name" TEXT,
    "city_id" INTEGER,
    "bio_about" TEXT,
    "banner_key" TEXT,
    "avatar_key" TEXT,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "interests" "interests_enum"[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_academic" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "gpa" DOUBLE PRECISION,
    "sat" INTEGER,
    "ielts" DOUBLE PRECISION,
    "toefl" INTEGER,

    CONSTRAINT "users_academic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_language_proficiency" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "level" "language_level_enum" NOT NULL,

    CONSTRAINT "users_language_proficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "email" TEXT,
    "subscription" "organization_subscription_type_enum" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "status" TEXT,
    "role" "organization_user_role_enum" NOT NULL DEFAULT 'STUDENT',
    "group_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_groups" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "mentions" TEXT[],
    "project_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "profession_category_enum" NOT NULL,
    "description" TEXT,
    "start_salary" DECIMAL(10,2),
    "end_salary" DECIMAL(10,2),
    "popularity" "popularity_enum",
    "skills" TEXT[],

    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "estimated_time_minutes" INTEGER,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "test_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "is_correct" BOOLEAN,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_submission" (
    "id" SERIAL NOT NULL,
    "test_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "TestSubmissionStatus" NOT NULL,
    "analysis_summary" TEXT,
    "analysis_key_factors" TEXT[],

    CONSTRAINT "test_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_submission_question" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,

    CONSTRAINT "test_submission_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_analysis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personality_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_analysis_mbti" (
    "id" SERIAL NOT NULL,
    "personality_analysis_id" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "mbti_code" TEXT,
    "mbti_name" TEXT,
    "short_attributes" TEXT[],
    "work_styles" TEXT[],
    "introversion_percentage" INTEGER,
    "thinking_percentage" INTEGER,
    "creativity_percentage" INTEGER,
    "intuition_percentage" INTEGER,
    "planning_percentage" INTEGER,
    "leading_percentage" INTEGER,

    CONSTRAINT "personality_analysis_mbti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_analysis_professions" (
    "id" SERIAL NOT NULL,
    "personality_analysis_id" INTEGER NOT NULL,
    "profession_id" INTEGER NOT NULL,
    "percentage" INTEGER,

    CONSTRAINT "personality_analysis_professions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_analysis_majors" (
    "id" SERIAL NOT NULL,
    "personality_analysis_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "personality_analysis_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_analysis_attributes" (
    "id" SERIAL NOT NULL,
    "personality_analysis_id" INTEGER NOT NULL,
    "type" "PersonalityAnalysisAttributeType" NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "recommendations" TEXT,

    CONSTRAINT "personality_analysis_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "description" TEXT,
    "foundation_year" TEXT,
    "financing_type" "InstitutionFinancingType" NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "website" TEXT,
    "email" TEXT,
    "contact_number" TEXT,
    "city_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "address" TEXT,
    "has_dorm" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_majors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "duration_years" INTEGER,
    "learning_language" TEXT,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" "InstitutionMajorCategory" NOT NULL,
    "institution_id" INTEGER NOT NULL,

    CONSTRAINT "institution_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_enrollment_documents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "institution_id" INTEGER NOT NULL,

    CONSTRAINT "institution_enrollment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_enrollment_requirements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EnrollmentRequirementType" NOT NULL,
    "value" TEXT,
    "institution_id" INTEGER NOT NULL,

    CONSTRAINT "institution_enrollment_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities_analysis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities_analysis_institutes" (
    "id" SERIAL NOT NULL,
    "universities_analysis_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "chance_percentage" DOUBLE PRECISION,

    CONSTRAINT "universities_analysis_institutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities_analysis_results_attributes" (
    "id" SERIAL NOT NULL,
    "universities_analysis_institutes_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "recommendation" TEXT,

    CONSTRAINT "universities_analysis_results_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities_analysis_results_plan" (
    "id" SERIAL NOT NULL,
    "universities_analysis_institutes_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration_month" INTEGER,

    CONSTRAINT "universities_analysis_results_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "interests" "interests_enum"[],
    "description" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "objectives" TEXT[],
    "skills" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'RECRUITMENT',
    "banner_image" TEXT,
    "logo_image" TEXT,
    "author_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "role" "ProjectMemberRole" NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "image_key" TEXT NOT NULL,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_socials" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "website_url" TEXT,
    "twitter_url" TEXT,

    CONSTRAINT "project_socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_votes" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoadmapType" NOT NULL,
    "institution_id" INTEGER,
    "profession_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "deadline_at" TIMESTAMP(3) NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_tasks" (
    "id" SERIAL NOT NULL,
    "roadmap_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_sub_tasks" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_sub_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE INDEX "countries_name_idx" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE INDEX "cities_name_idx" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_academic_user_id_key" ON "users_academic"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_user_id_key" ON "user_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "professions_name_key" ON "professions"("name");

-- CreateIndex
CREATE INDEX "professions_name_idx" ON "professions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "personality_analysis_mbti_personality_analysis_id_key" ON "personality_analysis_mbti"("personality_analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_socials_project_id_key" ON "project_socials"("project_id");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_academic" ADD CONSTRAINT "users_academic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_language_proficiency" ADD CONSTRAINT "users_language_proficiency_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "organization_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_groups" ADD CONSTRAINT "organization_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission" ADD CONSTRAINT "test_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission_question" ADD CONSTRAINT "test_submission_question_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "test_submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission_question" ADD CONSTRAINT "test_submission_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_submission_question" ADD CONSTRAINT "test_submission_question_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_analysis" ADD CONSTRAINT "personality_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_analysis_mbti" ADD CONSTRAINT "personality_analysis_mbti_personality_analysis_id_fkey" FOREIGN KEY ("personality_analysis_id") REFERENCES "personality_analysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_analysis_professions" ADD CONSTRAINT "personality_analysis_professions_personality_analysis_id_fkey" FOREIGN KEY ("personality_analysis_id") REFERENCES "personality_analysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_analysis_professions" ADD CONSTRAINT "personality_analysis_professions_profession_id_fkey" FOREIGN KEY ("profession_id") REFERENCES "professions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_analysis_majors" ADD CONSTRAINT "personality_analysis_majors_personality_analysis_id_fkey" FOREIGN KEY ("personality_analysis_id") REFERENCES "personality_analysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_analysis_attributes" ADD CONSTRAINT "personality_analysis_attributes_personality_analysis_id_fkey" FOREIGN KEY ("personality_analysis_id") REFERENCES "personality_analysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_majors" ADD CONSTRAINT "institution_majors_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_enrollment_documents" ADD CONSTRAINT "institution_enrollment_documents_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_enrollment_requirements" ADD CONSTRAINT "institution_enrollment_requirements_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities_analysis" ADD CONSTRAINT "universities_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities_analysis_institutes" ADD CONSTRAINT "universities_analysis_institutes_universities_analysis_id_fkey" FOREIGN KEY ("universities_analysis_id") REFERENCES "universities_analysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities_analysis_institutes" ADD CONSTRAINT "universities_analysis_institutes_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities_analysis_results_attributes" ADD CONSTRAINT "universities_analysis_results_attributes_universities_anal_fkey" FOREIGN KEY ("universities_analysis_institutes_id") REFERENCES "universities_analysis_institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities_analysis_results_plan" ADD CONSTRAINT "universities_analysis_results_plan_universities_analysis_i_fkey" FOREIGN KEY ("universities_analysis_institutes_id") REFERENCES "universities_analysis_institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_socials" ADD CONSTRAINT "project_socials_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_votes" ADD CONSTRAINT "project_votes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_votes" ADD CONSTRAINT "project_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_profession_id_fkey" FOREIGN KEY ("profession_id") REFERENCES "professions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_tasks" ADD CONSTRAINT "roadmap_tasks_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_sub_tasks" ADD CONSTRAINT "roadmap_sub_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "roadmap_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
