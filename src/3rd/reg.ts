import * as cheerio from "cheerio";
import * as qs from "qs";
import { CMUCred, RegCourse, RegInfo, StudentInfo } from "../types";

const OAUTH_BASE_URL = "http://localhost:3001";
const REG_BASE_URL = "http://localhost:3000";

type OAuthState = {
    view_state: string;
    view_state_generator: string;
    event_validation: string;
}

function parse_cookie_value(value: string, headers: string): string {
    const COOKIE_REGEX = new RegExp(`${value}=([^;]*)`);
    const MATCHES = COOKIE_REGEX.exec(headers);
    if (!MATCHES)
        return "";
    return MATCHES[1] || "";
}

function parse_oauth_state(response: string, set_cookie_str: string): OAuthState {
    const $ = cheerio.load(response);
    const VIEW_STATE = $("input#__VIEWSTATE").val() as string;
    const VIEW_STATE_GENERATOR = $("input#__VIEWSTATEGENERATOR").val() as string;
    const EVENT_VALIDATION = $("input#__EVENTVALIDATION").val() as string;
    const ASP_SESSION_ID = parse_cookie_value("ASP.NET_SessionId", set_cookie_str);
    return {
        view_state: VIEW_STATE,
        view_state_generator: VIEW_STATE_GENERATOR,
        event_validation: EVENT_VALIDATION,
    };
}

function update_oauth_state(old_state: OAuthState, new_state: OAuthState): OAuthState {
    const cloned_state = { ...old_state };
    cloned_state.view_state = new_state.view_state;
    cloned_state.view_state_generator = new_state.view_state_generator;
    cloned_state.event_validation = new_state.event_validation;
    return cloned_state;
}

async function get_session_id(): Promise<OAuthState> {
    const CLIENT_ID = "WW6UMKuxrT0gsywFCUFHTdm2TfJEzMTPCuQCc5gy";
    const REDIRECT_URI = "https://www1.reg.cmu.ac.th/registrationoffice/cmu-oauth-php/callback.php";
    const SCOPE = "cmuitaccount.basicinfo";
    const STATE = Math.random().toString(36).slice(2, 15);
    const URL = `${OAUTH_BASE_URL}/v1/Authorize.aspx?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${STATE}`;
    const RESPONSE = await fetch(URL, {
        credentials: "include",
        redirect: "manual"
    });
    const SET_COOKIE_STR = RESPONSE.headers.get("set-cookie") || "";
    return parse_oauth_state(await RESPONSE.text(), SET_COOKIE_STR);
}

async function oauth_init_state(): Promise<OAuthState> {
    const RESPONSE = await fetch(`${OAUTH_BASE_URL}/v1/Login/?continue=Registration+System`, { credentials: "include" });
    const SET_COOKIE_STR = RESPONSE.headers.get("set-cookie") || "";
    return update_oauth_state(
        await get_session_id(),
        parse_oauth_state(await RESPONSE.text(), SET_COOKIE_STR)
    );
}

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>
function construct_login_data(cred: AtLeast<CMUCred, "username">, state: OAuthState): string {
    return qs.stringify({
        ...{
            "__LASTFOCUS": "",
            "__EVENTTARGET": "",
            "__EVENTARGUMENT": "",
            "__VIEWSTATE": state.view_state,
            "__VIEWSTATEGENERATOR": state.view_state_generator,
            "__EVENTVALIDATION": state.event_validation,
        }, ...(cred.password ? {
            "ScriptManager1": "UpdatePanel1|btnLogin_submit",
            "user": cred.username,
            "password": cred.password,
            "chkbxKeepmesignin": "on",
            "btnLogin_submit": "Sign in",
            "__ASYNCPOST": "true",
        } : {
            "txtUser": cred.username,
            "btnLogin_next": "Next",
        })
    });
}

async function login_user(username: CMUCred["username"], state: OAuthState): Promise<OAuthState> {
    const URL = `${OAUTH_BASE_URL}/v1/Login/?continue=Registration+System`;
    const RESPONSE = await fetch(URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: construct_login_data({ username }, state)
    });
    const SET_COOKIE_STR = RESPONSE.headers.get("set-cookie") || "";
    return parse_oauth_state(await RESPONSE.text(), SET_COOKIE_STR);
}

function parse_oauth_redir(response: string): string {
    const OAUTH_CODE_REGEX = /(https:\/\/[^|]+)/;
    const CODE_MATCHES = decodeURIComponent(response)
        .match(OAUTH_CODE_REGEX);
    
    if (!CODE_MATCHES || CODE_MATCHES.length < 2 || !CODE_MATCHES[1])
        throw new Error("Failed to parse OAuth code");
    return CODE_MATCHES[1];
}

async function login_pwd(cred: CMUCred, state: OAuthState): Promise<string> {
    const URL = `${OAUTH_BASE_URL}/v1/Login/?continue=Registration+System`;
    const RESPONSE = await fetch(URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: construct_login_data(cred, state)
    });
    return parse_oauth_redir(await RESPONSE.text());
}

async function oauth_redir(url: string): Promise<void> {
    const NEW_URL = url.replace("https://www1.reg.cmu.ac.th", REG_BASE_URL);
    const RESPONSE = await fetch(NEW_URL, { credentials: "include" });
    if (!RESPONSE.ok)
        throw new Error(`Failed to fetch OAuth redirect URL ${NEW_URL}`);
}

function parse_reg_course(html: string): RegCourse[] {
    const $ = cheerio.load(html);
    const $rows = $("table.table.table-bordered.table-striped.sortable tr");
    const courses: RegCourse[] = []
    $rows.each((i, row) => {
        // ignore 2 first rows and 1 last row
        if (i < 2 || i > $rows.length - 2)
            return;
        function get_col_txt(col_idx: number): string {
            return $(row)
                .find(`td:eq(${col_idx})`)
                .text()
                .trim();
        }
        courses.push({
            course_no: get_col_txt(1),
            title: get_col_txt(2),
            lec_section: get_col_txt(3),
            lab_section: get_col_txt(4),
            lec_credit: get_col_txt(5),
            lab_credit: get_col_txt(6),
            schedule_day: get_col_txt(7),
            schedule_time: get_col_txt(8),
            type: get_col_txt(9),
            midterm_day: get_col_txt(11),
            midterm_time: get_col_txt(12),
            final_day: get_col_txt(13),
            final_time: get_col_txt(14)
        });
    });
    return courses;
}

async function get_reg_courses(): Promise<RegCourse[]> {
    const RESPONSE = await fetch(`${REG_BASE_URL}/registrationoffice/student/calendar_exam/`, { credentials: "include" });
    return parse_reg_course(await RESPONSE.text())
}

function parse_student_info(html: string): StudentInfo {
    const $ = cheerio.load(html);
    return {
        student_no: $("#mt2 > tbody > tr:nth-child(1) > td:nth-child(2)").text().trim(),
        name: $("#mt2 > tbody > tr:nth-child(2) > td:nth-child(2)").text().trim()
    }
}

async function get_student_info(): Promise<StudentInfo> {
    const RESPONSE = await fetch(`${REG_BASE_URL}/registrationoffice/student/main.php?mainfile=studentprofile`, { credentials: "include" });
    return parse_student_info(await RESPONSE.text())
}

export async function reg_login(cred: CMUCred): Promise<void> {
    const INITIAL_STATE = await oauth_init_state();
    const PRELOGIN_STATE = update_oauth_state(
        INITIAL_STATE,
        await login_user(cred.username, INITIAL_STATE)
    );
    const REDIR_URL = await login_pwd(cred, PRELOGIN_STATE);
    return oauth_redir(REDIR_URL);
}

export async function fetch_reg_info(cred: CMUCred): Promise<RegInfo> {
    await reg_login(cred);
    const STUDENT_INFO = await get_student_info();
    const COURSES = await get_reg_courses();
    return {
        student: STUDENT_INFO,
        courses: COURSES,
    }
}
