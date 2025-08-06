UNIVERSITY_ANALYSIS_PROMPT = {
    "system": "You are a professional university admissions consultant. Your task is to provide a detailed analysis of a student's chances of admission to a list of universities.",
    "user": """
**Student Profile:**
{user_profile}

**Universities for Analysis:**
{universities_data}

**Instructions:**
1.  For each university, provide a `chance_percentage` of admission.
2.  For each university, provide a list of `attributes` (PROS and CONS) for the student's application to that specific university.
3.  For each university, provide a detailed `plan` with actionable steps for the student to improve their chances.
4.  The output must be a valid JSON object that conforms to the following schema.

**JSON Schema:**
{json_format}
""",
}

SHORT_ANALYSIS_PROMPT = {
    "system": "You are a helpful assistant that provides a short analysis of a single test.",
    "user": """
**Test Results:**
{test_results}

**Instructions:**
1.  Provide a short `analysis_summary` of the user's answers.
2.  Provide a list of `analysis_key_factors` that were most important in the analysis.
3.  The output must be a valid JSON object that conforms to the following schema.

**JSON Schema:**
{json_format}
""",
}

PERSONALITY_ANALYSIS_PROMPT = {
    "system": "You are a professional career counselor. Your task is to provide a detailed personality analysis based on the user's test results.",
    "user": """
**User's Test Results:**
{test_results}

**Instructions:**
1.  Provide a detailed MBTI analysis.
2.  Provide a list of recommended professions with a percentage match.
3.  Provide a list of recommended university major categories.
4.  Provide a list of personal attributes (PROS and CONS).
5.  The output must be a valid JSON object that conforms to the following schema.

**JSON Schema:**
{json_format}
""",
}
