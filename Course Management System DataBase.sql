
CREATE TABLE users (
    id            BIGSERIAL,
    first_name    VARCHAR(100)  NOT NULL,
    last_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL, 
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);


CREATE TABLE courses (
    id             BIGSERIAL,
    title          VARCHAR(255)  NOT NULL,
    description    TEXT          NOT NULL,
    category       VARCHAR(100),
    status         VARCHAR(20)   NOT NULL,   
    instructor_id  BIGINT        NOT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_courses PRIMARY KEY (id),
    CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)
);



CREATE TABLE lessons (
    id             BIGSERIAL,
    course_id      BIGINT        NOT NULL,
    title          VARCHAR(255)  NOT NULL,
    content_url    VARCHAR(500),
    order_number   INT           NOT NULL,
    CONSTRAINT pk_lessons PRIMARY KEY (id),
    CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id)
);


CREATE TABLE enrollments (
    id             BIGSERIAL,
    student_id     BIGINT        NOT NULL,
    course_id      BIGINT        NOT NULL,
    enrolled_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    status         VARCHAR(20)   NOT NULL,  
    CONSTRAINT pk_enrollments PRIMARY KEY (id),
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_enrollments_course  FOREIGN KEY (course_id)  REFERENCES courses(id)
);


CREATE TABLE assignments (
    id             BIGSERIAL,
    course_id      BIGINT        NOT NULL,
    title          VARCHAR(255)  NOT NULL,
    description    TEXT          NOT NULL,
    due_date       TIMESTAMP     NOT NULL,
    total_marks    INT           NOT NULL,
    CONSTRAINT pk_assignments PRIMARY KEY (id),
    CONSTRAINT fk_assignments_course FOREIGN KEY (course_id) REFERENCES courses(id)
);


CREATE TABLE quizzes (
    id             BIGSERIAL,
    course_id      BIGINT        NOT NULL,
    title          VARCHAR(255)  NOT NULL,
    questions      TEXT          NOT NULL,   
    time_limit     INT,                      
    total_marks    INT           NOT NULL,
    CONSTRAINT pk_quizzes PRIMARY KEY (id),
    CONSTRAINT fk_quizzes_course FOREIGN KEY (course_id) REFERENCES courses(id)
);


CREATE TABLE submissions (
    id             BIGSERIAL,
    assignment_id  BIGINT        NOT NULL,
    student_id     BIGINT        NOT NULL,
    file_url       VARCHAR(500),
    submitted_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    status         VARCHAR(20)   NOT NULL,  
    CONSTRAINT pk_submissions PRIMARY KEY (id),
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    CONSTRAINT fk_submissions_student    FOREIGN KEY (student_id)    REFERENCES users(id)
);


CREATE TABLE grades (
    id             BIGSERIAL,
    submission_id  BIGINT        NOT NULL,
    student_id     BIGINT        NOT NULL,
    course_id      BIGINT        NOT NULL,   
    marks_awarded  INT           NOT NULL,
    feedback       TEXT,
    graded_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_grades PRIMARY KEY (id),
    CONSTRAINT fk_grades_submission FOREIGN KEY (submission_id) REFERENCES submissions(id),
    CONSTRAINT fk_grades_student    FOREIGN KEY (student_id)    REFERENCES users(id),
    CONSTRAINT fk_grades_course     FOREIGN KEY (course_id)     REFERENCES courses(id)
);


CREATE TABLE progress (
    id             BIGSERIAL,
    student_id     BIGINT        NOT NULL,
    course_id      BIGINT        NOT NULL,
    lesson_id      BIGINT        NOT NULL,
    completed      BOOLEAN       NOT NULL DEFAULT FALSE,
    completed_at   TIMESTAMP,
    CONSTRAINT pk_progress PRIMARY KEY (id),
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_progress_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
    CONSTRAINT fk_progress_lesson  FOREIGN KEY (lesson_id)  REFERENCES lessons(id)
);


CREATE INDEX idx_courses_instructor      ON courses(instructor_id);
CREATE INDEX idx_lessons_course          ON lessons(course_id);
CREATE INDEX idx_enrollments_student     ON enrollments(student_id);
CREATE INDEX idx_enrollments_course      ON enrollments(course_id);
CREATE INDEX idx_assignments_course      ON assignments(course_id);
CREATE INDEX idx_quizzes_course          ON quizzes(course_id);
CREATE INDEX idx_submissions_assignment  ON submissions(assignment_id);
CREATE INDEX idx_submissions_student     ON submissions(student_id);
CREATE INDEX idx_grades_submission       ON grades(submission_id);
CREATE INDEX idx_grades_student          ON grades(student_id);
CREATE INDEX idx_grades_course           ON grades(course_id);
CREATE INDEX idx_progress_student        ON progress(student_id);
CREATE INDEX idx_progress_course         ON progress(course_id);
CREATE INDEX idx_progress_lesson         ON progress(lesson_id);

