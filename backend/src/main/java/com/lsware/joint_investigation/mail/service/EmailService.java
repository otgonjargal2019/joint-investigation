package com.lsware.joint_investigation.mail.service;

import com.lsware.joint_investigation.mail.service.util.CustomMailSender;
import com.lsware.joint_investigation.util.Email;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

@Service
@EnableAsync
public class EmailService {

	@Autowired
	private CustomMailSender customMailSender;

	@Value("${nft.mail.smtp.user}")
	private String smtpUser;

	@Async
	public void sendEmailHtml(Email email) {
		if (email != null
				&& email.getRecipientList() != null
				&& email.getRecipientList().length != 0) {

			JavaMailSenderImpl mailSender = customMailSender.builder();

			try {
				MimeMessage message = mailSender.createMimeMessage();
				message.setSubject(email.getSubject());
				MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

				helper.setFrom(new InternetAddress(smtpUser, "JOINT-INVESTIGATION Team"));
				helper.setTo(email.getRecipientList());
				helper.setText(email.getContent(), true);

				mailSender.send(message);

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
}
