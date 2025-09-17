package com.lsware.joint_investigation.util;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public class Email {

	public String[] recipientList;
	public String senderEmail;
	public String subject;
	public String content;
	public List<MultipartFile> attachments;

	public String[] getRecipientList() {
		return recipientList;
	}

	public void setRecipientList(String[] recipientList) {
		this.recipientList = recipientList;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public List<MultipartFile> getAttachments() {
		return attachments;
	}

	public void setAttachments(List<MultipartFile> attachments) {
		this.attachments = attachments;
	}

	public String getSenderEmail() {
		return senderEmail;
	}

	public void setSenderEmail(String senderEmail) {
		this.senderEmail = senderEmail;
	}
}
