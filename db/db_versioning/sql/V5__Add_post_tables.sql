CREATE TABLE post_views (
	post_view_id uuid NOT NULL,
	viewed_at timestamp(6) NOT NULL,
	post_id uuid NOT NULL,
	user_id uuid NOT NULL,
	CONSTRAINT post_views_pkey PRIMARY KEY (post_view_id),
	CONSTRAINT ukgyayt4et9uio5nu46mm5xsksd UNIQUE (post_id, user_id)
);


-- post_views foreign keys

ALTER TABLE post_views ADD CONSTRAINT fkiiwykhlbhjwi5cxxcx9n76cd6 FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE post_views ADD CONSTRAINT fkm1fm9hc7487k4j6qd2g1iq0k2 FOREIGN KEY (post_id) REFERENCES posts(post_id);


CREATE TABLE post_attachments (
	attachment_id uuid NOT NULL,
	created_at timestamp(6) NOT NULL,
	file_name varchar(255) NOT NULL,
	file_url varchar(255) NOT NULL,
	post_id uuid NOT NULL,
	CONSTRAINT post_attachments_pkey PRIMARY KEY (attachment_id)
);


-- post_attachments foreign keys

ALTER TABLE post_attachments ADD CONSTRAINT fkdwocy2l1nlf11ebpfrax6sto1 FOREIGN KEY (post_id) REFERENCES posts(post_id);