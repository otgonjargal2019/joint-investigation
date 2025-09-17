package com.lsware.joint_investigation.mail.service.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class CustomMailSender {
	protected static Logger logger = LoggerFactory.getLogger(CustomMailSender.class);

	@Value("${nft.mail.smtp.host}")
	private String host;

	@Value("${nft.mail.smtp.port}")
	private int port;

	@Value("${nft.mail.smtp.user}")
	private String username;

	@Value("${nft.mail.smtp.pass}")
	private String password;

	@Value("${nft.mail.smtp.transport}")
	private String transport;

	@Value("${nft.mail.smtp.starttls}")
	private boolean starttls;

	@Value("${nft.mail.smtp.auth}")
	private boolean auth;

	public JavaMailSenderImpl builder() {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setHost(this.host);
		mailSender.setPort(this.port);
		mailSender.setUsername(this.username);
		mailSender.setPassword(this.password);

		Properties props = mailSender.getJavaMailProperties();
		props.put("mail.transport.protocol", this.transport);
		props.put("mail.smtp.auth", this.auth);
		props.put("mail.smtp.starttls.enable", this.starttls);
		// ADDED
		props.put("mail.smtp.starttls.required", "true");
		props.put("mail.debug", "true");
		props.put("mail.smtp.ssl.enable", "false");

		return mailSender;
	}
}
