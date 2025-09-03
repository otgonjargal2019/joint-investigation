-- Initial schema baseline migration
-- This migration establishes the base schema structure for the joint investigation platform
-- Based on database dump from 2025-09-01

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- ========================================
-- CORE TABLES
-- ========================================

-- Users table - stores all platform user information
CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    login_id character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name_kr character varying(50) NOT NULL,
    name_en character varying(100),
    email character varying(100) NOT NULL,
    phone character varying(20),
    country character varying(10) NOT NULL,
    department character varying(100),
    role character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    profile_image_url character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['PLATFORM_ADMIN'::character varying, 'INV_ADMIN'::character varying, 'INVESTIGATOR'::character varying, 'RESEARCHER'::character varying, 'COPYRIGHT_HOLDER'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);

COMMENT ON TABLE public.users IS '플랫폼의 모든 사용자 정보를 저장하는 테이블';
COMMENT ON COLUMN public.users.role IS '사용자 역할 (PLATFORM_ADMIN, INV_ADMIN, INVESTIGATOR, RESEARCHER, COPYRIGHT_HOLDER)';
COMMENT ON COLUMN public.users.status IS '계정 상태 (PENDING, ACTIVE, INACTIVE)';

-- Cases table - stores copyright infringement case information
CREATE TABLE public.cases (
    case_id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_name character varying(255) NOT NULL,
    case_outline text,
    content_type character varying(50),
    infringement_type character varying(50),
    related_countries character varying(10),
    priority integer,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    investigation_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    etc character varying,
    CONSTRAINT cases_priority_check CHECK (((priority >= 1) AND (priority <= 5))),
    CONSTRAINT cases_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'ON_HOLD'::character varying, 'CLOSED'::character varying])::text[])))
);

COMMENT ON TABLE public.cases IS '저작권 침해 사건의 기본 정보를 저장하는 테이블';
COMMENT ON COLUMN public.cases.related_countries IS '관련 국가 코드 목록 (e.g., {"KR", "TH"})';
COMMENT ON COLUMN public.cases.status IS '사건 상태 (OPEN, ON_HOLD, CLOSED)';

-- Investigation records table - stores detailed investigation activities
CREATE TABLE public.investigation_records (
    record_id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    record_name character varying(255) NOT NULL,
    content text,
    security_level integer NOT NULL,
    progress_status character varying(30),
    review_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    rejection_reason text,
    created_by uuid NOT NULL,
    reviewer_id uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT investigation_records_progress_status_check CHECK (((progress_status)::text = ANY ((ARRAY['PRE_INVESTIGATION'::character varying, 'INVESTIGATION'::character varying, 'REVIEW'::character varying, 'PROSECUTION'::character varying, 'CLOSED'::character varying])::text[]))),
    CONSTRAINT investigation_records_review_status_check CHECK (((review_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT investigation_records_security_level_check CHECK (((security_level >= 1) AND (security_level <= 6)))
);

COMMENT ON TABLE public.investigation_records IS '사건에 대한 상세 수사 활동 기록';
COMMENT ON COLUMN public.investigation_records.security_level IS 'LBAC를 위한 보안 등급 (1이 가장 높음)';
COMMENT ON COLUMN public.investigation_records.progress_status IS '상세 진행 현황 (PRE_INVESTIGATION, INVESTIGATION, REVIEW, PROSECUTION, CLOSED)';
COMMENT ON COLUMN public.investigation_records.review_status IS '수사 관리자 검토 상태 (PENDING, APPROVED, REJECTED)';

-- ========================================
-- RELATIONSHIP TABLES
-- ========================================

-- Case assignees table - junction table connecting cases with assigned investigators/managers
CREATE TABLE public.case_assignees (
    case_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.case_assignees IS '사건과 담당 수사관/관리자를 연결하는 조인 테이블';

-- ========================================
-- FILE AND SECURITY TABLES
-- ========================================

-- Keys table - stores re-encrypted key information for file access control
CREATE TABLE public.keys (
    key_id uuid DEFAULT gen_random_uuid() NOT NULL,
    record_id uuid NOT NULL,
    re_encrypted_key_info character varying(512) NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    pubkey_user_id uuid,
    privkey_user_id uuid,
    reference_file_tag uuid[]
);

COMMENT ON COLUMN public.keys.key_id IS '재암호화 된 key 고유 id';
COMMENT ON COLUMN public.keys.record_id IS '관련 수사기록 id';
COMMENT ON COLUMN public.keys.re_encrypted_key_info IS '재암호화 된 키 값';
COMMENT ON COLUMN public.keys.pubkey_user_id IS '재암호화 시 사용한 공개키 소유자 id';
COMMENT ON COLUMN public.keys.privkey_user_id IS '재암호화 시 사용한 개인키 소유자 id';
COMMENT ON COLUMN public.keys.reference_file_tag IS '관련 파일 고유 id 리스트(최대 2개 : 수사보고서 / 디지털증거물) - 1. 추가정보로 uuid를 리스트로 넣기 위한 별도의 작업이 필요할수도 있음. 2. FK 지정 안되어있음';

-- File view permissions table - supports AB-PRE for file-level user access permissions
CREATE TABLE public.file_view_permissions (
    file_id uuid NOT NULL,
    user_id uuid NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.file_view_permissions IS 'AB-PRE를 지원하기 위한 파일별 사용자 열람 권한';

-- Attach file table - stores file metadata and access control information
CREATE TABLE public.attach_file (
    file_id uuid DEFAULT gen_random_uuid() NOT NULL,
    record_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(20) NOT NULL,
    file_size bigint,
    mime_type character varying(100),
    file_hash character varying(255),
    storage_path character varying(512) NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    digital_evidence boolean,
    investigation_report boolean,
    authorized_user_id_list uuid[],
    authorized_user_re_encrypt_key_id_list uuid[],
    CONSTRAINT attach_file_file_type_check CHECK (((file_type)::text = ANY (ARRAY[('EVIDENCE'::character varying)::text, ('REPORT'::character varying)::text])))
);

COMMENT ON COLUMN public.attach_file.file_type IS '파일 유형 (EVIDENCE: 디지털 증거물, REPORT: 수사 보고서)';
COMMENT ON COLUMN public.attach_file.storage_path IS '외부 스토리지(MinIO 등) 내 파일의 실제 경로';
COMMENT ON COLUMN public.attach_file.authorized_user_id_list IS '열람 허가된 수사관 id 목록';
COMMENT ON COLUMN public.attach_file.authorized_user_re_encrypt_key_id_list IS '열람 허가된 수사관의 재암호화키 id 목록';

-- ========================================
-- COMMUNICATION TABLES
-- ========================================

-- Posts table - stores notices and research information posts
CREATE TABLE public.posts (
    post_id uuid DEFAULT gen_random_uuid() NOT NULL,
    board_type character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT posts_board_type_check CHECK (((board_type)::text = ANY ((ARRAY['NOTICE'::character varying, 'RESEARCH'::character varying])::text[])))
);

COMMENT ON TABLE public.posts IS '공지사항 및 조사정보 게시물을 저장하는 통합 테이블';
COMMENT ON COLUMN public.posts.board_type IS '게시판 유형 (NOTICE: 공지사항, RESEARCH: 조사정보)';

-- Messages table - stores 1:1 messages between users
CREATE TABLE public.messages (
    message_id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.messages IS '사용자 간 1:1 메시지 내용';

-- Notifications table - stores system-generated notifications for users
CREATE TABLE public.notifications (
    notification_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    related_url character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.notifications IS '사용자에게 보내는 시스템 생성 알림';

-- ========================================
-- TEST TABLE (to be removed in production)
-- ========================================

-- Test user table - temporary table for testing purposes
CREATE TABLE public.test_user (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    country character varying(255),
    department character varying(255),
    email character varying(255),
    name_en character varying(255),
    name_kr character varying(255),
    password character varying(255) NOT NULL,
    phone character varying(255),
    profile_image_url character varying(255),
    status character varying(255),
    username character varying(255) NOT NULL
);

-- ========================================
-- PRIMARY KEY CONSTRAINTS
-- ========================================

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (case_id);

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_pkey PRIMARY KEY (record_id);

ALTER TABLE ONLY public.case_assignees
    ADD CONSTRAINT case_assignees_pkey PRIMARY KEY (case_id, user_id);

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT keys_pkey PRIMARY KEY (key_id);

ALTER TABLE ONLY public.file_view_permissions
    ADD CONSTRAINT file_view_permissions_pkey PRIMARY KEY (file_id, user_id);

ALTER TABLE ONLY public.attach_file
    ADD CONSTRAINT attach_file_pk PRIMARY KEY (file_id);

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (post_id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);

ALTER TABLE ONLY public.test_user
    ADD CONSTRAINT test_user_pkey PRIMARY KEY (id);

-- ========================================
-- UNIQUE CONSTRAINTS
-- ========================================

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_id_key UNIQUE (login_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.test_user
    ADD CONSTRAINT ukjy6u3ejcprgrjhwg0v9uftm8g UNIQUE (username);

ALTER TABLE ONLY public.test_user
    ADD CONSTRAINT ukpa18l8pesg1udna0oedmd07cx UNIQUE (email);

ALTER TABLE ONLY public.test_user
    ADD CONSTRAINT ukd65h3on1pq94qv7wbnhjv9jhl UNIQUE (phone);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX idx_cases_created_by ON public.cases USING btree (created_by);
CREATE INDEX idx_case_assignees_user_id ON public.case_assignees USING btree (user_id);
CREATE INDEX idx_investigation_records_case_id ON public.investigation_records USING btree (case_id);
CREATE INDEX idx_investigation_records_created_by ON public.investigation_records USING btree (created_by);
CREATE INDEX idx_files_record_id ON public.keys USING btree (record_id);
CREATE INDEX idx_files_uploaded_by ON public.keys USING btree (uploaded_by);
CREATE INDEX idx_file_view_permissions_user_id ON public.file_view_permissions USING btree (user_id);
CREATE INDEX idx_posts_created_by ON public.posts USING btree (created_by);
CREATE INDEX idx_messages_sender_recipient ON public.messages USING btree (sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================

-- Cases foreign keys
ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);

-- Case assignees foreign keys
ALTER TABLE ONLY public.case_assignees
    ADD CONSTRAINT case_assignees_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.case_assignees
    ADD CONSTRAINT case_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Investigation records foreign keys
ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id);

-- Keys foreign keys
ALTER TABLE ONLY public.keys
    ADD CONSTRAINT files_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.investigation_records(record_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT keys_fk FOREIGN KEY (pubkey_user_id) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.keys
    ADD CONSTRAINT keys_fk_1 FOREIGN KEY (privkey_user_id) REFERENCES public.users(user_id);

-- File view permissions foreign keys
ALTER TABLE ONLY public.file_view_permissions
    ADD CONSTRAINT file_view_permissions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.keys(key_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.file_view_permissions
    ADD CONSTRAINT file_view_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;

-- Attach file foreign keys
ALTER TABLE ONLY public.attach_file
    ADD CONSTRAINT attach_file_fk FOREIGN KEY (record_id) REFERENCES public.investigation_records(record_id);

ALTER TABLE ONLY public.attach_file
    ADD CONSTRAINT attach_file_fk_1 FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);

-- Posts foreign keys
ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);

-- Messages foreign keys
ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(user_id);

-- Notifications foreign keys
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
