import { CONFIG_RESPOSITORY } from "../repository";
import { CMUCred, StudentInfo } from "types";

export type MangoInfo = {
    student: MangoUser,
    courses: MangoCourse[],
    events: MangoEvent[]
}

export type MangoEventType = "assignment";

export type MangoAssignment = {
    id: string;
    description: string | null;
    due_at: string;
    unlock_at: string | null;
    lock_at: string | null;
    points_possible: number;
    grading_type: string;
    assignment_group_id: string;
    grading_standard_id: string | null;
    created_at: string;
    updated_at: string;
    peer_reviews: boolean;
    automatic_peer_reviews: boolean;
    position: number;
    grade_group_students_individually: boolean;
    anonymous_peer_reviews: boolean;
    group_category_id: string | null;
    post_to_sis: boolean;
    moderated_grading: boolean;
    omit_from_final_grade: boolean;
    intra_group_peer_reviews: boolean;
    anonymous_instructor_annotations: boolean;
    anonymous_grading: boolean;
    graders_anonymous_to_graders: boolean;
    grader_count: number;
    grader_comments_visible_to_graders: boolean;
    final_grader_id: string | null;
    grader_names_visible_to_final_grader: boolean;
    allowed_attempts: number;
    annotatable_attachment_id: string | null;
    hide_in_gradebook: boolean;
    secure_params: string;
    lti_context_id: string;
    course_id: number;
    name: string;
    submission_types: string[];
    has_submitted_submissions: boolean;
    due_date_required: boolean;
    max_name_length: number;
    in_closed_grading_period: boolean;
    graded_submissions_exist: boolean;
    user_submitted: boolean;
    is_quiz_assignment: boolean;
    can_duplicate: boolean;
    original_course_id: string | null;
    original_assignment_id: string | null;
    original_lti_resource_link_id: string | null;
    original_assignment_name: string | null;
    original_quiz_id: string | null;
    workflow_state: string;
    important_dates: boolean;
    is_quiz_lti_assignment: boolean;
    frozen_attributes: string[];
    muted: boolean;
    html_url: string;
    url: string | null;
    sis_assignment_id: string | null;
    integration_id: string | null;
    integration_data: Record<string, unknown>;
    published: boolean;
    only_visible_to_overrides: boolean;
    visible_to_everyone: boolean;
    locked_for_user: boolean;
    submissions_download_url: string;
    post_manually: boolean;
    anonymize_students: boolean;
    require_lockdown_browser: boolean;
    restrict_quantitative_data: boolean;
}

export type MangoEvent = {
    title: string;
    description: string | null;
    submission_types: string;
    workflow_state: string;
    created_at: string;
    updated_at: string;
    all_day: boolean;
    all_day_date: string;
    id: string;
    type: MangoEventType;
    assignment: MangoAssignment;
    html_url: string;
    context_code: string;
    context_name: string;
    context_color: string | null;
    end_at: string;
    start_at: string;
    url: string;
    important_dates: boolean;
}

export type MangoUser = {
    id: number;
    name: string;
    created_at: string;
    sortable_name: string;
    short_name: string;
    avatar_url: string;
    last_name: string;
    first_name: string;
    locale: string | null;
    effective_locale: string;
};

export type MangoCourse = {
    id: number;
    name: string;
    account_id: number;
    uuid: string;
    start_at: string | null;
    grading_standard_id: string | null;
    is_public: boolean;
    created_at: string;
    course_code: string;
    default_view: string;
    root_account_id: number;
    enrollment_term_id: number;
    license: string;
    grade_passback_setting: string | null;
    end_at: string | null;
    public_syllabus: boolean;
    public_syllabus_to_auth: boolean;
    storage_quota_mb: number;
    is_public_to_auth_users: boolean;
    homeroom_course: boolean;
    course_color: string | null;
    friendly_name: string | null;
    apply_assignment_group_weights: boolean;
    time_zone: string;
    blueprint: boolean;
    template: boolean;
    sis_course_id: string;
    integration_id: string | null;
    hide_final_grades: boolean;
    workflow_state: string;
    restrict_enrollments_to_course_dates: boolean;
};

const MANGO_BASE_URL = "http://localhost:3002/api/v1"

async function fetch_student_info(cred: CMUCred): Promise<MangoUser> {
    const URL = `${MANGO_BASE_URL}/users/self`
    const RESPONSE = await fetch(URL, {
        headers: {
            authorization: `Bearer ${cred.mango_token}`
        }
    })
    return RESPONSE.json();
}

async function fetch_events(cred: CMUCred, info: MangoUser, courses: MangoCourse[]): Promise<MangoEvent[]> {
    const { start, end } = CONFIG_RESPOSITORY.termDuration();
    const PARAMS_ARR = courses.map(course => `context_codes[]=course_${course.id}`);
    PARAMS_ARR.push(`context_codes[]=user_${info.id}`);
    PARAMS_ARR.push(`start_date=${start.toISOString()}`);
    PARAMS_ARR.push(`end_date=${end.toISOString()}`);
    PARAMS_ARR.push("type=assignment");
    PARAMS_ARR.push("per_page=100");

    const PARAMS = PARAMS_ARR.join("&");
    const URL = `${MANGO_BASE_URL}/calendar_events?${PARAMS}`;
    const RESPONSE = await fetch(URL, {
        headers: {
            authorization: `Bearer ${cred.mango_token}`
        }
    });
    return RESPONSE.json();
}

async function fetch_courses(cred: CMUCred): Promise<MangoCourse[]> {
    const URL = `${MANGO_BASE_URL}/users/self/courses`
    const RESPONSE = await fetch(URL, {
        headers: {
            authorization: `Bearer ${cred.mango_token}`
        }
    });
    return RESPONSE.json();
}

export async function mango_verify(cred: CMUCred): Promise<void> {
    await fetch_student_info(cred);
}

export async function fetch_mango_info(cred: CMUCred): Promise<MangoInfo> {
    const STUDENT_INFO = await fetch_student_info(cred);
    const COURSES = await fetch_courses(cred);
    return {
        student: STUDENT_INFO,
        courses: COURSES,
        events: await fetch_events(cred, STUDENT_INFO, COURSES),
    }
}