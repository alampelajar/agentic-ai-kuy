--
-- PostgreSQL database dump
--

\restrict wULU6TJBdDrmRjrQCd2YTGxnrZN1G1Sc2HAtVlhJHwcCUyywHGrKIPkPh5upWBy

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: a_iproviders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.a_iproviders (
    id bigint NOT NULL,
    user_id bigint,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    base_url text NOT NULL,
    api_key_encrypted text,
    type character varying(50) DEFAULT 'custom'::character varying NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.a_iproviders OWNER TO postgres;

--
-- Name: a_iproviders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.a_iproviders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.a_iproviders_id_seq OWNER TO postgres;

--
-- Name: a_iproviders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.a_iproviders_id_seq OWNED BY public.a_iproviders.id;


--
-- Name: agent_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_models (
    id bigint NOT NULL,
    agent_id bigint NOT NULL,
    ai_model_id bigint NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.agent_models OWNER TO postgres;

--
-- Name: agent_models_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agent_models_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agent_models_id_seq OWNER TO postgres;

--
-- Name: agent_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agent_models_id_seq OWNED BY public.agent_models.id;


--
-- Name: agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    provider character varying(50) DEFAULT 'openrouter'::character varying NOT NULL,
    model character varying(150) DEFAULT 'anthropic/claude-3.5-sonnet'::character varying NOT NULL,
    temperature numeric DEFAULT 0.7,
    system_prompt text,
    tools text,
    status character varying(30) DEFAULT 'ready'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    slug character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.agents OWNER TO postgres;

--
-- Name: agents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agents_id_seq OWNER TO postgres;

--
-- Name: agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agents_id_seq OWNED BY public.agents.id;


--
-- Name: ai_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_models (
    id bigint NOT NULL,
    provider_id bigint NOT NULL,
    user_id bigint,
    name character varying(150) NOT NULL,
    model_id character varying(200) NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.ai_models OWNER TO postgres;

--
-- Name: ai_models_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_models_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_models_id_seq OWNER TO postgres;

--
-- Name: ai_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_models_id_seq OWNED BY public.ai_models.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token_hash text NOT NULL,
    expired_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone,
    revoked_at timestamp with time zone
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: task_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_messages (
    id bigint NOT NULL,
    task_id bigint NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    model character varying(255),
    model_id bigint,
    provider character varying(255),
    created_at timestamp with time zone
);


ALTER TABLE public.task_messages OWNER TO postgres;

--
-- Name: task_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_messages_id_seq OWNER TO postgres;

--
-- Name: task_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_messages_id_seq OWNED BY public.task_messages.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    agent_id bigint,
    title character varying(255) NOT NULL,
    description text,
    status character varying(30) DEFAULT 'todo'::character varying NOT NULL,
    label character varying(50) DEFAULT 'feature'::character varying NOT NULL,
    priority character varying(30) DEFAULT 'medium'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    model_id bigint
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    avatar text,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: a_iproviders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.a_iproviders ALTER COLUMN id SET DEFAULT nextval('public.a_iproviders_id_seq'::regclass);


--
-- Name: agent_models id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_models ALTER COLUMN id SET DEFAULT nextval('public.agent_models_id_seq'::regclass);


--
-- Name: agents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents ALTER COLUMN id SET DEFAULT nextval('public.agents_id_seq'::regclass);


--
-- Name: ai_models id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models ALTER COLUMN id SET DEFAULT nextval('public.ai_models_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: task_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_messages ALTER COLUMN id SET DEFAULT nextval('public.task_messages_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: a_iproviders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.a_iproviders (id, user_id, name, slug, base_url, api_key_encrypted, type, is_system, is_active, created_at, updated_at, deleted_at) FROM stdin;
1	\N	NaraRouter	nararouter	https://router.bynara.id/v1		nararouter	t	t	2026-09-11 13:27:51.186262+07	2026-09-11 13:27:51.186262+07	\N
2	1	Open Router	open-router	https://openrouter.ai/api/v1	pJg6dYTtWPVJf84aQgqJuyhUPNZaUFdICoZAUdGeMSR2yrSFOIqn8lRpoz5YcEc56OxvuKgO42juI9p23MpGIPTklXX7FwMWGVPqqjVAOMMYhPi6Z4eBS0jEDgrqSSYlzXy3S7M=	openai	f	t	2026-09-11 15:52:06.992795+07	2026-09-11 15:52:06.992795+07	\N
\.


--
-- Data for Name: agent_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_models (id, agent_id, ai_model_id, is_default, created_at, updated_at) FROM stdin;
1	19	1	t	2026-09-11 14:04:58.151774+07	2026-09-11 14:04:58.151774+07
2	20	1	t	2026-09-11 14:04:58.151774+07	2026-09-11 14:04:58.151774+07
3	21	1	t	2026-09-11 14:04:58.151774+07	2026-09-11 14:04:58.151774+07
4	22	1	t	2026-09-11 14:04:58.151774+07	2026-09-11 14:04:58.151774+07
5	23	1	t	2026-09-11 14:04:58.151774+07	2026-09-11 14:04:58.151774+07
26	19	2	f	\N	\N
53	19	4	f	2026-09-11 16:58:33.707853+07	2026-09-11 16:58:33.707853+07
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents (id, user_id, name, description, provider, model, temperature, system_prompt, tools, status, created_at, updated_at, deleted_at, slug, is_active) FROM stdin;
19	1	Coding Agent	Membuat, mengubah, memperbaiki, dan mengembangkan kode aplikasi.	openrouter	anthropic/claude-3.5-sonnet	0.7	\N	\N	ready	2026-09-11 14:04:58.151774+07	2026-09-17 10:09:55.893245+07	\N	coding	t
20	1	Testing Agent	Menguji aplikasi dan membantu menemukan masalah atau bug pada sistem.	openrouter	anthropic/claude-3.5-sonnet	0.7	\N	\N	ready	2026-09-11 14:04:58.151774+07	2026-09-17 10:09:55.895976+07	\N	testing	t
21	1	Code Review Agent	Menganalisis kode untuk menemukan masalah kualitas dan potensi kesalahan.	openrouter	anthropic/claude-3.5-sonnet	0.7	\N	\N	ready	2026-09-11 14:04:58.151774+07	2026-09-17 10:09:55.896665+07	\N	review	t
22	1	Planning Agent	Menganalisis goal dan membuat rencana pengerjaan yang terstruktur.	openrouter	anthropic/claude-3.5-sonnet	0.7	\N	\N	ready	2026-09-11 14:04:58.151774+07	2026-09-17 10:09:55.897738+07	\N	planning	t
23	1	Debugging Agent	Menganalisis error dan membantu menemukan penyebab serta solusi masalah.	openrouter	anthropic/claude-3.5-sonnet	0.7	\N	\N	ready	2026-09-11 14:04:58.151774+07	2026-09-17 10:09:55.898365+07	\N	debugging	t
\.


--
-- Data for Name: ai_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_models (id, provider_id, user_id, name, model_id, description, is_system, is_active, created_at, updated_at, deleted_at) FROM stdin;
1	1	\N	Agnes 2.5 Flash	agnes-2.5-flash	Model NaraRouter untuk kebutuhan AI umum.	t	t	2026-09-11 13:27:51.190415+07	2026-09-11 13:27:51.190415+07	\N
2	1	\N	DeepSeek V4 Flash	deepseek-v4-flash	Model DeepSeek untuk coding, reasoning, dan general chat.	t	t	\N	\N	\N
3	2	1	gemini-2.5-flash	gemini-2.5-flash	Open Router	f	t	2026-09-11 15:52:07.020662+07	2026-09-11 15:52:07.020662+07	\N
4	2	1	GPT	openai/gpt-oss-20b:free	MODEL GPT gpt-oss-20b	f	t	2026-09-11 16:58:33.663323+07	2026-09-11 16:58:33.663323+07	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, expired_at, created_at, revoked_at) FROM stdin;
1	1	6728e2fec23425ef27c61b825fac60e6376412805ce6261483bb3679fa83a052	2026-09-15 13:27:28.511+07	2026-09-08 13:27:28.511+07	\N
2	1	a2f621a1cae15e91955f24cf10e072dd57dd14768cac2e4f5de6068337da43e3	2026-09-15 14:59:29.611+07	2026-09-08 14:59:29.613+07	\N
3	2	e42897aa72fea9def30116986e3b7a1c5581246af7ea8938449047b8c3be5272	2026-09-15 16:39:31.34+07	2026-09-08 16:39:31.341+07	\N
4	1	75b8dfcb7aaacceea0dd1d08457c40be2306e4522453019982a5319fad4811ab	2026-09-16 09:22:38.464+07	2026-09-09 09:22:38.465+07	\N
5	1	f883ed1bb5fd56f547d01d070b7ab675550676b15fdeba2aa8dcfa5c9e5dca9e	2026-09-16 09:36:36.947+07	2026-09-09 09:36:36.948+07	\N
6	1	b9f3ad2a164fb05a3f590a4eecf53ec80a76bd5d9112747b3ac92f44be79fb08	2026-09-16 09:59:16.127+07	2026-09-09 09:59:16.128+07	2026-09-09 10:02:25.884+07
7	1	8086d9a8636c34a6d24d14311688f51598044a3bce08273b6ab56d7fb6e76942	2026-09-16 10:02:25.888+07	2026-09-09 10:02:25.893+07	2026-09-09 10:11:40.554+07
8	1	71357af1ce84cdf5bc61fd48ff97f3da6a16992def33a82bf17fbb19c54671be	2026-09-16 10:11:40.569+07	2026-09-09 10:11:40.569+07	\N
9	1	141217aad6ba1d42422e1113412083fb58985d038220529e6731d81f029e0e4d	2026-09-16 10:15:17.729+07	2026-09-09 10:15:17.736+07	2026-09-09 10:16:06.158+07
10	1	3dfd89ec8fa73906ae9daaa664fa24e28a0d6ae75914a8c296349b0f565efdd0	2026-09-16 10:16:06.165+07	2026-09-09 10:16:06.165+07	2026-09-09 10:17:53.848+07
11	1	cd52b09d3f05f9c0b5472080f4671b420f2e3f016f01c324017b75845cfab61e	2026-09-16 10:17:53.854+07	2026-09-09 10:17:53.855+07	2026-09-09 10:18:13.716+07
12	1	cbfb746f037db2863140907096fa52cda45f0e1bf1bb33d7fe019603e865fdff	2026-09-16 10:18:13.722+07	2026-09-09 10:18:13.723+07	2026-09-09 10:19:40.058+07
13	1	b96aa7d397a9b2cee720fac3bc3b10d827683e2b284e58ff935954bc6f1a1b90	2026-09-16 10:19:40.065+07	2026-09-09 10:19:40.066+07	2026-09-09 10:21:15.732+07
14	1	36bd882b1b10172615f716ca194a8f6fe801a2e14501c70e85d76bebbac867d4	2026-09-16 10:21:15.74+07	2026-09-09 10:21:15.74+07	2026-09-09 10:23:34.088+07
15	1	3179456bb9024ad3bc5ab555eca30d3dd3b371550fb7a50a538be03531922ef6	2026-09-16 10:23:34.093+07	2026-09-09 10:23:34.094+07	\N
16	2	ea07f8792b4726ed9bb76c6f3b25041fb27dcf13c0415ad39c4d97ecade57891	2026-09-16 10:45:04.907+07	2026-09-09 10:45:04.908+07	\N
17	1	54f0428f2336ebf7a07c3c0273e3474f1aeadc1686ce3ef5cddbcc44a26c8320	2026-09-16 13:05:55.726+07	2026-09-09 13:05:55.726+07	\N
18	1	6a88c07df802e7cedd11cbe9cbfe052b06b67a75af0dc29f561c537f753bb085	2026-09-16 13:09:15.467+07	2026-09-09 13:09:15.469+07	\N
19	1	9505089f4e27d54837133f333c627dee5e16feed0352549f70bf02049e266229	2026-09-16 13:33:59.276+07	2026-09-09 13:33:59.277+07	\N
20	1	1b62f01b9fcff7a345e18f780f1e793506fd19bd74e56bd07d801c8128bc7e38	2026-09-16 13:36:35.511+07	2026-09-09 13:36:35.511+07	\N
21	1	982fdea03a7aff9f9c85fc2d0c9b317c3bbb25414cd66959c4f953f6cd433c70	2026-09-16 13:36:38.61+07	2026-09-09 13:36:38.611+07	\N
22	1	81aac39f9fa6e207bd444bb3e0355c2fa7f7e85e077fd49384481c77b87935ec	2026-09-16 13:37:17.667+07	2026-09-09 13:37:17.668+07	\N
23	1	4a170ab902eac30fe02e2dc41214bd3c38f84d3b6beea536a56da3c0debdb3c6	2026-09-16 13:41:10.613+07	2026-09-09 13:41:10.614+07	\N
24	1	095dedcd1b27981cb393e1d773f3658682b5357f376eb9473fff3b4495593931	2026-09-16 14:42:46.663759+07	2026-09-09 14:42:46.663759+07	\N
25	2	7d95788c4ca08e681e1390d2fcfb7809cbecb0905b0dc0a85b6162703b2f623b	2026-09-16 15:07:41.666834+07	2026-09-09 15:07:41.666834+07	\N
26	1	ee26acd788870fe9afda3eb6fa41cef072891de5747b97edded7747ff66e794b	2026-09-16 15:26:40.972041+07	2026-09-09 15:26:40.972869+07	2026-09-09 15:41:57.032574+07
27	1	1787dc4fc0893c6c7545e5c8d6e7f9eed0abdbd709931d85643df89b41d8773a	2026-09-16 15:41:57.037165+07	2026-09-09 15:41:57.037165+07	\N
28	1	5808fc749664f1feb07fac8c9e8ab64b2328759b4a3668af9795bb2933e9f449	2026-09-16 15:42:08.537799+07	2026-09-09 15:42:08.537799+07	\N
29	1	fc823ba5fa11bd63c1d74b7c705b40312648b38f7f7c2038de0a693b56bb446f	2026-09-16 15:42:29.417129+07	2026-09-09 15:42:29.417129+07	2026-09-09 16:04:59.878999+07
30	1	c0969f507d0f3bbc97342c58032278bca77353726bd503caa386859af1f52ff4	2026-09-16 16:04:59.880438+07	2026-09-09 16:04:59.880438+07	\N
31	1	a48a2c52d0c698060d52b1932c1eb7741d1571b29a2fddaf38bc4447a8eebd89	2026-09-16 16:08:32.015816+07	2026-09-09 16:08:32.015816+07	\N
32	1	0fccda547ee06b9a88fff553534e1ecdb3d7a83b7d96c9e047b13ebd8821b158	2026-09-17 09:21:13.788963+07	2026-09-10 09:21:13.801422+07	\N
33	1	83b5165191971a067fc56efdfed77df869b14b3c099951da751bd0fcaefba1c2	2026-09-17 10:25:18.590575+07	2026-09-10 10:25:18.591949+07	\N
34	1	47a5bc13a2e76b5c7acc6e2f52fe35ce1b93de5209983c1e9c1faa134f6045de	2026-09-17 10:53:22.918882+07	2026-09-10 10:53:22.9215+07	\N
35	1	177391423166cb96c77a3c452609c9de59c484394e4db5d984945b96bb3e2dc7	2026-09-17 13:14:50.767654+07	2026-09-10 13:14:50.771358+07	\N
36	1	3b5b72e88fc25ab8fe63ab8ee195023275878b9180f5eb2ae2ea750334777084	2026-09-17 13:49:58.227008+07	2026-09-10 13:49:58.228127+07	\N
37	1	ecc29b5b07fcaf6f250cf0e69f1fa2722da9b4302f3a4776f888461ceaebe140	2026-09-17 15:07:28.494578+07	2026-09-10 15:07:28.49558+07	\N
38	1	0551b4fed883bdc56ceb55df653fa953f34ce7ae968ca6610a8475d6d81b8844	2026-09-17 15:08:13.493709+07	2026-09-10 15:08:13.493709+07	\N
39	1	d4af8a5172cf6059623a39d6a80aed93860577ae7cb533a784632a02bb165229	2026-09-17 15:28:01.014816+07	2026-09-10 15:28:01.015817+07	\N
40	1	542affe5ee1ff4d2affe3483732eb2d5ef1d36063dabe86cf6d09b47fcd00acc	2026-09-17 15:48:15.12907+07	2026-09-10 15:48:15.130069+07	\N
41	1	b168187d0325e013684c3cd31fb02df5ca9f1004cb5c91a07e3477d20a9cceca	2026-09-17 16:06:49.909524+07	2026-09-10 16:06:49.911362+07	\N
42	1	1644acc379318c0edd4006fbb3579659370d4feb10d2f819d9dc045df7020517	2026-09-17 16:22:44.256896+07	2026-09-10 16:22:44.256896+07	\N
43	1	f02f4ec90359aeea192760024f36921e9042268d6efface876d1f8fbf0257d87	2026-09-18 08:41:11.723559+07	2026-09-11 08:41:11.723559+07	\N
44	1	906459948742ffd8b4a1517b8546108e79548032a8495e7424d5127062b87c8c	2026-09-18 09:14:26.491174+07	2026-09-11 09:14:26.491174+07	\N
45	1	f1d969d03b27ea48d3eca1c306ffef904bb586926b0a75af07b56684b92f516f	2026-09-18 09:27:34.519221+07	2026-09-11 09:27:34.520681+07	\N
46	1	b6335be2e1adf83640b7905eccc8446b5a5141ee7dbe328adf6c637375ac2c78	2026-09-18 09:47:35.067471+07	2026-09-11 09:47:35.067471+07	\N
47	1	2a9c177593c7a259d2ac729e8b0c8cc3fc2ef4b57658fb8ce0fe32d62210c77e	2026-09-18 10:09:54.382664+07	2026-09-11 10:09:54.382664+07	\N
48	17	65e4404393650d30c23eb39a8d1e859873d0f7a2e2eb798c0c1dbf5781cbc7af	2026-09-18 10:26:17.239072+07	2026-09-11 10:26:17.239762+07	\N
49	1	76d25968080b3bddf6c6123115487ac4c55993b84f9553e75cab6131b4557f5e	2026-09-18 10:44:57.55037+07	2026-09-11 10:44:57.55037+07	\N
50	1	3fc746a5999726b81c0b19a5f31b598119730540c30a769b7496c29dfc25e60d	2026-09-18 11:04:01.566223+07	2026-09-11 11:04:01.570354+07	\N
51	1	ea2c44644daa4a4d3054323bdbee8a95e411058654d9d2f52367e756d648cf14	2026-09-18 11:22:22.13968+07	2026-09-11 11:22:22.13968+07	\N
52	1	5c66e82c2259739ea7c84d74f73287da34de6153db4ce3bc47b9e99e3340ee17	2026-09-18 11:33:30.810395+07	2026-09-11 11:33:30.810395+07	\N
53	1	b7c20ae8ac91b4ddc38aa411f56e53a2866ec3e7ccf61c68091ca86077615410	2026-09-18 11:36:55.765389+07	2026-09-11 11:36:55.76639+07	\N
54	1	e5dc545163f75227fa5feed188ce41e32e72f78f2e3a2e2156011173fbd6827c	2026-09-18 12:51:23.776727+07	2026-09-11 12:51:23.776727+07	\N
55	1	e0e9df2ea94898166b049e8e1ce3a4f59f39174e39c529ad3469117a6b7ab355	2026-09-18 13:13:21.458925+07	2026-09-11 13:13:21.458925+07	\N
56	1	492b1d83ceeaa3c5a1d4e22c46d1473560dc6d302cab08e51c67fb2273e493ca	2026-09-18 13:28:43.027563+07	2026-09-11 13:28:43.037764+07	\N
57	1	b3f8ab2d14d3a85f0e199621182643dc2cee4a9dfb2ef7e5580894c46fdb3fba	2026-09-18 13:46:39.212405+07	2026-09-11 13:46:39.213094+07	\N
58	1	a09777729f6d235aae12b4fd6d3f1a3e29a9053f97e82b7c26e074e03d0bd6cc	2026-09-18 14:05:23.11604+07	2026-09-11 14:05:23.11604+07	\N
59	1	7646cfec388ef852a81c58f3d48f465c8856dc1d14f76c70b568fa6ccc717b8d	2026-09-18 14:23:33.743067+07	2026-09-11 14:23:33.743067+07	\N
60	1	224e3cdf0fd2eec28ada59e17293c454491bc2991af7b0781726e5f859d41275	2026-09-18 14:39:07.802739+07	2026-09-11 14:39:07.803286+07	\N
61	1	042a5cbd2b5ed828503926952c43a0816d8c17ce05fa1735e89dd207581feae3	2026-09-18 14:55:52.99161+07	2026-09-11 14:55:52.99161+07	\N
62	1	a98656f271dbf14d59601dcd01d7ada9bd9585e4d472acd630dd1e10046420f5	2026-09-18 15:11:04.260794+07	2026-09-11 15:11:04.260794+07	\N
63	1	a07cc1a799d102921f4299410d823cb56f239b9787b44de18ac821a30fd5bf41	2026-09-18 15:38:52.848587+07	2026-09-11 15:38:52.852093+07	\N
64	1	209772063a0a6fdf0184eccd8dfdaff8e5476e883d4e7ebe5389c72c059b8647	2026-09-18 15:53:59.417943+07	2026-09-11 15:53:59.419065+07	\N
65	1	c9ed3cb7f8cefa5962205b216d41f9284c4f2f576d5f08124d41ed53a1916844	2026-09-18 16:11:49.397939+07	2026-09-11 16:11:49.512908+07	\N
66	1	72a4915de07e61db6c86f0764b23f37663d71f19e1c7e2065521c14943e08b25	2026-09-18 16:44:33.289385+07	2026-09-11 16:44:33.297+07	\N
67	1	17561da0469ba8466af0e59076882fc4f1deae593b1ddd0041d31cfc5103ba47	2026-09-18 16:59:53.748332+07	2026-09-11 16:59:53.748332+07	\N
68	1	6aaa51ae1090764181fcbfe4dc1269f0dec11d1bd7428b2cb72742745afe7205	2026-09-21 11:39:19.72965+07	2026-09-14 11:39:19.72965+07	\N
69	1	d145388cea3652bdb217d8cbf4ad425ff133fcbf4a942effcf22355c8c5d6b20	2026-09-21 12:14:50.193363+07	2026-09-14 12:14:50.193363+07	\N
70	1	13cf9d4fb34b47397096ac7074e4fe604419d725b7e41c4f0d0dafec5768d516	2026-09-21 12:49:24.338525+07	2026-09-14 12:49:24.338525+07	\N
71	1	c3ff000b937fc247adeacc1093117b88ada99e3dbc73b93f6d70080cc2b98ed9	2026-09-21 13:44:04.857251+07	2026-09-14 13:44:04.857251+07	\N
72	1	4ba98dc997233771217eda2272e5bd112a8723f0152a4623670c2c37eb7841b0	2026-09-21 14:02:08.598872+07	2026-09-14 14:02:08.598872+07	\N
73	1	380a1c3d478606e920ece5e3e64be166bc5881ede9150621a962e88b4209e481	2026-09-21 14:17:46.631471+07	2026-09-14 14:17:46.63325+07	\N
74	1	49642e4263738fb0a821d66bfd2fe0eb02d833302779009f16abc8168e7b6e1f	2026-09-21 14:32:49.665072+07	2026-09-14 14:32:49.665072+07	\N
75	1	82e77f2578867a68ab81905884423de5a78abe5a2c754d68d9bb86eea622a44d	2026-09-21 14:48:25.296103+07	2026-09-14 14:48:25.296103+07	\N
76	1	a5f819ca631e56ac4e71167c365a12cb7c6abcd8343cdf3532daf650240088d3	2026-09-21 15:03:45.429156+07	2026-09-14 15:03:45.429156+07	\N
77	1	c980ddacdb970c1e6f4d7014dc10213834d9d75c5e8bfb0be1438a90f078304a	2026-09-21 15:18:47.058396+07	2026-09-14 15:18:47.058396+07	\N
78	1	c92d3fbef86cad5361092554453f5fe99c8f07f686ea58b323721d5124e96c10	2026-09-21 15:37:41.636341+07	2026-09-14 15:37:41.640455+07	\N
79	1	d610b7df24e7d4086854a2e0da5c9f2bb2bf5b574e6ae4bf9908973b37660e11	2026-09-21 16:59:02.982781+07	2026-09-14 16:59:02.982781+07	\N
80	1	ffdd6aa0cd6b72b19aa7a3d6238a7fe87bf33fcf28f77f2e946ff7f63643aca7	2026-09-22 12:20:56.83071+07	2026-09-15 12:20:56.83071+07	\N
81	1	9c0e6288a61a619ac9bebf48b61b6921e10afff8ff0c1327ef7f9ea840dff1bd	2026-09-22 14:39:55.955351+07	2026-09-15 14:39:55.95642+07	\N
82	1	5988b5949e49bbf115a4d3367d5d2b82ca7aa949e1fb52db823f723d879d21a5	2026-09-22 14:51:01.689764+07	2026-09-15 14:51:01.690766+07	\N
83	1	c1c14251906f03d289eb2e6da53ce258c800ff47569a567cf8155efe904d12c6	2026-09-22 15:25:18.302171+07	2026-09-15 15:25:18.302171+07	\N
84	1	df30d0560a03ad962684e0a8605b5b872486641d53f11fc30f344df94f0ba678	2026-09-22 15:40:26.746202+07	2026-09-15 15:40:26.747368+07	\N
85	1	3e711dc88e84bea1152a595e17bda2ecfd292815e60824c2e6aaa6de87701aeb	2026-09-22 15:58:45.556347+07	2026-09-15 15:58:45.556347+07	\N
86	1	caf444abb55d0d7806cbc4eec1d356368d7c95acfe192a7d8696521b1a7f029c	2026-09-22 18:12:39.083254+07	2026-09-15 18:12:39.083528+07	\N
87	1	24d9cd274f3331916582acbbf49fb2965eca2242b509e07ea2d5ff49435267f0	2026-09-22 18:33:04.254583+07	2026-09-15 18:33:04.25565+07	\N
88	1	11be4d3019ad452d813b1d52fb0bb47fc035bb5220093090fb06023ee87e81b3	2026-09-23 10:34:23.663359+07	2026-09-16 10:34:23.663359+07	\N
89	1	f6cdcea6cbce48fcebb5fdaf6a96ca91cb15153ffd24a549f0ad7a64bf5b79e3	2026-09-23 12:38:20.297411+07	2026-09-16 12:38:20.297411+07	\N
90	1	82743802a5b93fba33a64048aaae4d0fb62998447de33d9cc73cae75d6b26c16	2026-09-23 16:13:58.854684+07	2026-09-16 16:13:58.854684+07	\N
91	1	6963d36084d291e2c75702e9d14cf27d88825b394c16e673ea4a195951089c9c	2026-09-23 16:41:42.516916+07	2026-09-16 16:41:42.516916+07	\N
92	1	e082c292541cda6b6764bd94cea0bf5e53a53412ff5f8e31476e31e695512025	2026-09-23 16:52:28.904944+07	2026-09-16 16:52:28.904944+07	\N
93	1	db832a5eb090712f7b6b77c68e82c8c15ea43f12059b6f842cdf88bb8621a073	2026-09-23 17:11:48.598369+07	2026-09-16 17:11:48.598819+07	\N
94	1	17af26a88bfec293e1f9681b950a0835f5bb9fbf41bbc92573cb738167e28cf7	2026-09-23 17:31:42.474275+07	2026-09-16 17:31:42.474275+07	\N
95	1	b1e2fa93da3a373ae2d996452d8de35403048456089782c8440280c4caaefc60	2026-09-23 17:50:52.267085+07	2026-09-16 17:50:52.267085+07	\N
96	1	e7c7e88a46a632ecb27d90be3dd30aca6af105f6469762e00e3f0e7390f5c986	2026-09-24 09:25:21.028662+07	2026-09-17 09:25:21.028662+07	\N
97	1	e86b51f12ebdaa69c88dc922f1548a9d5329aee9a78a698e090797dbd620507b	2026-09-24 10:01:08.683224+07	2026-09-17 10:01:08.683472+07	\N
98	1	b47fa047e14b8e3e2ac5b7a02e9c822f0f6a0270cf72068f6fe10a939a6913ae	2026-09-24 10:21:02.209473+07	2026-09-17 10:21:02.209473+07	2026-09-17 10:36:06.210698+07
99	1	cf5a1ada4249881ad8d8247e9aef8794b75aa341894e635f36badf635b0d78b6	2026-09-24 10:36:06.211765+07	2026-09-17 10:36:06.211765+07	\N
100	1	ecb0c6bab860b1bbc6abd07365372ad4853dea1cd8f8f51994fd21747febae80	2026-09-24 10:44:46.178739+07	2026-09-17 10:44:46.178739+07	\N
101	1	5972d0a002599e9efe5bdfc1ea45055ab4fe7378c50a625e697b06ccfae3cc57	2026-09-24 11:10:46.134902+07	2026-09-17 11:10:46.134902+07	\N
102	2	b0c47c8a2feaebc0ad8a623dcb567d1c1ce9f1c2aeb93c97172cb78226359e60	2026-09-24 11:28:07.45498+07	2026-09-17 11:28:07.455093+07	\N
103	1	2611f64a1a7f0a60969f766110a25ace4faae2faf1c69f693f8d1864cc6459c8	2026-09-24 11:28:21.419861+07	2026-09-17 11:28:21.419861+07	\N
\.


--
-- Data for Name: task_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_messages (id, task_id, role, content, model, model_id, provider, created_at) FROM stdin;
1	6	user	siapa saya		\N		2026-09-17 10:21:26.658151+07
2	6	assistant	Maaf, saya tidak tahu siapa Anda. Saya adalah Agnes, AI assistant dari Sapiens AI. Tidak ada informasi pribadi tentang diri Anda yang saya simpan atau ketahui.\n\nAda yang bisa saya bantu? 😊	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:21:29.179762+07
3	7	user	nama saya alam		\N		2026-09-17 10:21:54.857245+07
4	7	assistant	Halo, Alam! Senang berkenalan denganmu. Ada yang bisa saya bantu?	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:21:57.608925+07
5	8	user	siapa nama saya		\N		2026-09-17 10:22:13.469106+07
6	8	assistant	Maaf, saya tidak tahu nama Anda. Ini percakapan pertama kita, jadi saya belum mengenal Anda. \n\nBoleh kasih tahu saya nama Anda? 😊	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:22:15.812198+07
7	9	user	nama saya ucup		\N		2026-09-17 10:30:16.911909+07
8	9	assistant	Halo Ucup! Senang berkenalan denganmu. Ada yang bisa saya bantu?	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:30:22.612167+07
9	10	user	siapa  nama saya		\N		2026-09-17 10:30:38.706697+07
10	10	assistant	Maaf, saya tidak mengetahui nama Anda. Kami baru mulai percakapan ini dan Anda belum pernah memberitahu nama Anda.\n\nJika Anda ingin, silakan beritahu saya nama Anda! 😊	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:30:46.23974+07
11	11	user	halo		\N		2026-09-17 10:35:16.749839+07
12	11	assistant	Halo! Ada yang bisa saya bantu?	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:35:21.869923+07
13	11	user	nama saya ucup		\N		2026-09-17 10:35:28.807989+07
14	11	assistant	Halo, Ucup! Senang berkenalan denganmu. Ada yang bisa saya bantu?	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:35:33.242231+07
15	12	user	siapa nama saya		\N		2026-09-17 10:36:00.822427+07
16	12	assistant	Saya belum tahu nama Anda. Kalau mau, silakan beri tahu saya, ya! 😊	agnes-2.5-flash	1	NaraRouter	2026-09-17 10:36:06.228223+07
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, user_id, agent_id, title, description, status, label, priority, created_at, updated_at, model_id) FROM stdin;
1	1	19	buatkan saya landing page sederhana	buatkan saya landing page sederhana	done	feature	medium	2026-09-17 09:30:46.104773+07	2026-09-17 09:31:42.912039+07	\N
2	1	19	buatkan website portofolio sederhana	buatkan website portofolio sederhana	done	feature	medium	2026-09-17 10:01:31.020142+07	2026-09-17 10:03:00.696638+07	\N
3	1	19	saya alam	saya alam	done	feature	medium	2026-09-17 10:10:43.714138+07	2026-09-17 10:10:48.062048+07	\N
4	1	19	siapa nama saya	siapa nama saya	done	feature	medium	2026-09-17 10:10:58.250989+07	2026-09-17 10:11:01.218797+07	\N
5	1	19	buatkan saya website sederhana	buatkan saya website sederhana	done	feature	medium	2026-09-17 10:11:29.52841+07	2026-09-17 10:11:50.941134+07	\N
6	1	19	siapa saya	siapa saya	done	feature	medium	2026-09-17 10:21:26.638501+07	2026-09-17 10:21:29.197276+07	1
7	1	19	nama saya alam	nama saya alam	done	feature	medium	2026-09-17 10:21:54.838092+07	2026-09-17 10:21:57.628905+07	1
8	1	19	siapa nama saya	siapa nama saya	done	feature	medium	2026-09-17 10:22:13.452466+07	2026-09-17 10:22:15.824845+07	1
9	1	19	nama saya ucup	nama saya ucup	done	feature	medium	2026-09-17 10:30:16.893549+07	2026-09-17 10:30:22.62279+07	1
10	1	19	siapa  nama saya	siapa  nama saya	done	feature	medium	2026-09-17 10:30:38.684885+07	2026-09-17 10:30:46.250922+07	1
11	1	19	halo	halo	done	feature	medium	2026-09-17 10:35:16.725594+07	2026-09-17 10:35:33.256907+07	1
12	1	19	siapa nama saya	siapa nama saya	done	feature	medium	2026-09-17 10:36:00.802577+07	2026-09-17 10:36:06.240312+07	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, avatar, role, created_at, updated_at, deleted_at) FROM stdin;
1	Alam	alam@gmail.com	$2a$10$H10HkDfNVNaxbkqrBvzBfeXasXjr0iSPA3D1j7Q5GHqMsEUJkWaYe		admin	2026-09-08 10:03:08.214+07	2026-09-08 10:03:08.214+07	\N
3	ucup	wuiwui@jimel.com	$2a$10$D7VprPkUlwJDk0t6PsLcAOlvgwIGnHMXphkqMHaEjv6LRnPhQc9mG		user	2026-09-08 13:27:09.399+07	2026-09-08 13:27:09.399+07	\N
17	RUKMANA NUR ALAMSYAH	rukmanaalam@gmail.com	$2a$10$.V5YGvQmtlvBVOTl8.CAcOzkxlc.QihNvJX.HfjnR4qetw1D5RCTC	https://lh3.googleusercontent.com/a/ACg8ocKotWNqECOCsA62kp1abpJizEmb2-99jBsEZeufB8pzahajba6d=s96-c	user	2026-09-11 10:26:17.226688+07	2026-09-11 10:26:17.226688+07	\N
2	Pawang Alam	pawangalam18@gmail.com	$2a$10$Y6rbZMzzYATrV8JMdsmVnOiLGNHwuC825sr1.PlKMoOcQ36P2eiuG	https://lh3.googleusercontent.com/a/ACg8ocIg2ZsZz8HxjZH41d0tK6FdXYdVdDs0AffFzEHQggpIOnXYdQA=s96-c	user	2026-09-08 11:02:01.578+07	2026-09-17 11:28:07.452019+07	\N
\.


--
-- Name: a_iproviders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.a_iproviders_id_seq', 2, true);


--
-- Name: agent_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agent_models_id_seq', 143, true);


--
-- Name: agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agents_id_seq', 23, true);


--
-- Name: ai_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_models_id_seq', 4, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 103, true);


--
-- Name: task_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_messages_id_seq', 16, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: a_iproviders a_iproviders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.a_iproviders
    ADD CONSTRAINT a_iproviders_pkey PRIMARY KEY (id);


--
-- Name: agent_models agent_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_models
    ADD CONSTRAINT agent_models_pkey PRIMARY KEY (id);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: ai_models ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: task_messages task_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_messages
    ADD CONSTRAINT task_messages_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_a_iproviders_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_a_iproviders_deleted_at ON public.a_iproviders USING btree (deleted_at);


--
-- Name: idx_a_iproviders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_a_iproviders_user_id ON public.a_iproviders USING btree (user_id);


--
-- Name: idx_agent_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_agent_model ON public.agent_models USING btree (agent_id, ai_model_id);


--
-- Name: idx_agent_models_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_models_agent_id ON public.agent_models USING btree (agent_id);


--
-- Name: idx_agent_models_ai_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agent_models_ai_model_id ON public.agent_models USING btree (ai_model_id);


--
-- Name: idx_agents_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agents_deleted_at ON public.agents USING btree (deleted_at);


--
-- Name: idx_agents_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_agents_slug ON public.agents USING btree (slug);


--
-- Name: idx_agents_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_agents_user_id ON public.agents USING btree (user_id);


--
-- Name: idx_ai_models_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_models_deleted_at ON public.ai_models USING btree (deleted_at);


--
-- Name: idx_ai_models_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_models_provider_id ON public.ai_models USING btree (provider_id);


--
-- Name: idx_ai_models_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_models_user_id ON public.ai_models USING btree (user_id);


--
-- Name: idx_refresh_tokens_token_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_refresh_tokens_token_hash ON public.refresh_tokens USING btree (token_hash);


--
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_task_messages_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_messages_model_id ON public.task_messages USING btree (model_id);


--
-- Name: idx_task_messages_task_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_messages_task_id ON public.task_messages USING btree (task_id);


--
-- Name: idx_tasks_agent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_agent_id ON public.tasks USING btree (agent_id);


--
-- Name: idx_tasks_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_model_id ON public.tasks USING btree (model_id);


--
-- Name: idx_tasks_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_user_id ON public.tasks USING btree (user_id);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: ai_models fk_a_iproviders_models; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT fk_a_iproviders_models FOREIGN KEY (provider_id) REFERENCES public.a_iproviders(id);


--
-- Name: a_iproviders fk_a_iproviders_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.a_iproviders
    ADD CONSTRAINT fk_a_iproviders_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: agent_models fk_agent_models_agent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_models
    ADD CONSTRAINT fk_agent_models_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- Name: agent_models fk_agent_models_ai_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_models
    ADD CONSTRAINT fk_agent_models_ai_model FOREIGN KEY (ai_model_id) REFERENCES public.ai_models(id);


--
-- Name: agents fk_agents_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT fk_agents_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens fk_refresh_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks fk_tasks_agent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_agent FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- Name: task_messages fk_tasks_messages; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_messages
    ADD CONSTRAINT fk_tasks_messages FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks fk_tasks_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict wULU6TJBdDrmRjrQCd2YTGxnrZN1G1Sc2HAtVlhJHwcCUyywHGrKIPkPh5upWBy

