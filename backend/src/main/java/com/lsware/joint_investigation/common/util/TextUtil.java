package com.lsware.joint_investigation.common.util;

//import java.util.Date;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.JsonNode;
//import com.nftplus.about.entity.ServiceInfo;


public class TextUtil {

	// private static String emailRegex =
	// "/^(([^<>()[\\]\\.,;:\\s@\"]+(\\.[^<>()[\\]\\.,;:\\s@\"]+)*)|(\\\".+\\\"))@(([^<>()[\\]\\.,;:\\s@\\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\\"]{2,})$/i";
	private static final Pattern phoneRegex = Pattern.compile("^[8-9][0-9]{7}$", Pattern.CASE_INSENSITIVE);
	private static final Pattern emailRegex = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$",
			Pattern.CASE_INSENSITIVE);
	private static final Pattern emailOrPhoneRegex = Pattern
			.compile("(^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$)|(^[8-9][0-9]{7}$)", Pattern.CASE_INSENSITIVE);

	private static final String _REG_EXP_PHONE = "(^02.{0}|^01.{1}|^0[0-9]{2})-?([0-9]{3,4})-?([0-9]{4})$";
	private static final Pattern MOBILE_PATTERN = Pattern.compile(_REG_EXP_PHONE);

	public static String cleanString(JsonNode node) {
		return cleanString(node, "");
	}

	public static String cleanString(JsonNode node, String defaultValue) {
		String result = defaultValue;

		if (node != null) {
			result = node.asText(defaultValue);
		}

		return result;
	}

	public static String toString(Object input, String defaultValue) {
		String result = defaultValue;
		try {
			if (input != null) {
				result = String.valueOf(input);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}

	/**
	 * 
	 * @param phone a phone number
	 * @return digits only
	 */
	public static String cleanPhone(String phone) {
		if (phone == null) {
			return null;
		}

		String digits = "";
		char[] phoneChars = phone.toCharArray();

		for (int i = 0; i < phoneChars.length; i++) {
			if (Character.isDigit(phoneChars[i])) {
				digits += phoneChars[i];
			}
		}
		return digits;
	}

	/**
	 * 
	 * @param phone  a digits only phone number
	 * @param format format, (use '#' for a digit)
	 * @return formatted phone number
	 */
	public static String separatePhone(String phone, String format) {
		if (phone == null || format == null) {
			return null;
		}

		String result = "";
		char[] formatChars = format.toCharArray();
		char[] phoneChars = phone.toCharArray();
		int i = 0;
		int j = 0;

		while (i < formatChars.length) {
			if (formatChars[i] != '#') {
				result += formatChars[i];
			} else if (j < phoneChars.length) {
				result += phoneChars[j++];
			}
			i += 1;
		}
		return result;
	}

	/**
	 * 
	 * @param email the email address
	 * @return true if email has only one '@' and
	 *         only one '.' after '@', false otherwise
	 */
	// public static boolean isValidEmail(String email) {
	// if (email == null || email.isEmpty()) {
	// return false;
	// }

	// if (hasCharOnlyOnce(email, '@')) {
	// String domain = email.substring(email.indexOf('@'));
	// if (hasCharOnlyOnce(domain, '.')) {
	// return true;
	// } else {
	// return false;
	// }
	// }
	// return false;
	// }

	/**
	 * 
	 * @param str the string
	 * @param ch  char to be checked in the string
	 * @return true if the string contains the char only once,
	 *         false otherwise
	 */
	public static boolean hasCharOnlyOnce(String str, char ch) {
		if (str == null) {
			return false;
		}

		char[] charArr = str.toCharArray();
		int count = 0;
		for (int i = 0; i < charArr.length; i++) {
			if (charArr[i] == ch) {
				count += 1;
			}
		}
		return count == 1;
	}

	public static String getExtensionWithDot(String fileName, String defaultResult) {
		if (fileName != null) {
			int i = fileName.lastIndexOf(".");
			if (i != -1 && i != fileName.length() - 1)
				return fileName.substring(i);
		}
		return defaultResult;
	}

	public static String getExtensionWithoutDot(String fileName, String defaultResult) {
		if (fileName != null) {
			int i = fileName.lastIndexOf(".");
			if (i != -1 && i != fileName.length() - 1)
				return fileName.substring(i + 1).toLowerCase();
		}
		return defaultResult;
	}

	public static boolean isValidEmailOrPhone(String input) {
		Matcher matcher = emailOrPhoneRegex.matcher(input);
		return matcher.find();
	}

	public static boolean isValidEmail(String input) {
		Matcher matcher = emailRegex.matcher(input);
		return matcher.find();
	}

	public static boolean isValidPhone(String input) {
		Matcher matcher = phoneRegex.matcher(input);
		return matcher.find();
	}

	public static int getRandNum(int min, int max) {
		return ThreadLocalRandom.current().nextInt(min, max + 1);
	}

	public static boolean isStringEqual(String s1, String s2) {
		if (!isEmptyString(s1) && !isEmptyString(s2)) {
			return s1.trim().equalsIgnoreCase(s2.trim());
		}
		return false;
	}

	public static boolean isEmptyString(String string) {
		return string == null || string.equals("") || string.trim().equals("");
	}

	// public static ServiceInfo.TYPE getServiceTypeFromString(String str) {
	// 	if ("terms".equals(str)) {
	// 		return ServiceInfo.TYPE.TERMS_OF_USE;
	// 	} else if ("privacypolicy".equals(str)) {
	// 		return ServiceInfo.TYPE.PRIVACY_POLICY;
	// 	} else if ("servicepolicy".equals(str)) {
	// 		return ServiceInfo.TYPE.SERVICE_POLICY;
	// 	}
	// 	return null;
	// }

	public static Boolean isMobile(String mobile) {
		Matcher match = MOBILE_PATTERN.matcher(mobile);
		return match.find();
	}

	public static String requestReplace(String paramValue, String gubun) {

		String result = "";

		if (paramValue != null) {

			paramValue = paramValue.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

			paramValue = paramValue.replaceAll("\\*", "");
			paramValue = paramValue.replaceAll("\\?", "");
			paramValue = paramValue.replaceAll("\\[", "");
			paramValue = paramValue.replaceAll("\\{", "");
			paramValue = paramValue.replaceAll("\\(", "");
			paramValue = paramValue.replaceAll("\\)", "");
			paramValue = paramValue.replaceAll("\\^", "");
			paramValue = paramValue.replaceAll("\\$", "");
			paramValue = paramValue.replaceAll("'", "");
			paramValue = paramValue.replaceAll("@", "");
			paramValue = paramValue.replaceAll("%", "");
			paramValue = paramValue.replaceAll(";", "");
			paramValue = paramValue.replaceAll(":", "");
			paramValue = paramValue.replaceAll("-", "");
			paramValue = paramValue.replaceAll("#", "");
			paramValue = paramValue.replaceAll("--", "");
			paramValue = paramValue.replaceAll("-", "");
			paramValue = paramValue.replaceAll(",", "");

			if (gubun != "encodeData") {
				paramValue = paramValue.replaceAll("\\+", "");
				paramValue = paramValue.replaceAll("/", "");
				paramValue = paramValue.replaceAll("=", "");
			}

			result = paramValue;

		}
		return result;
	}

	/**
	 * isNull
	 * 
	 * @param str
	 * @return
	 */
	public static boolean isNull(String str) {
		if (str != null) {
			str = str.trim();
		}

		return (str == null || "".equals(str));
	}

	/**
	 * null2string
	 * 
	 * @param str
	 * @param defaultValue
	 * @return
	 */
	public static String null2string(String str, String defaultValue) {

		if (isNull(str)) {
			return defaultValue;
		}

		return str;
	}

	public static String appendSuffix(String fileName, String suffix) {
		if (isEmptyString(fileName)) {
			return "";
		}
		String newFileName = "";
		int indexOfDot = fileName.lastIndexOf('.');
		if (indexOfDot != -1) {
			newFileName = fileName.substring(0, indexOfDot);
			newFileName += suffix;
			newFileName += fileName.substring(indexOfDot);
		} else {
			newFileName = fileName + suffix;
		}
		return newFileName;
	}

	public static String filePathBlackList(String value) {
		String returnValue = value;
		if (returnValue == null || returnValue.trim().equals("")) {
			return "";
		}

		returnValue = returnValue.replaceAll("\\.\\./", ""); // ../
		returnValue = returnValue.replaceAll("\\.\\.\\\\", ""); // ..\

		return returnValue;
	}

	/**
	 * 행안부 보안취약점 점검 조치 방안.
	 *
	 * @param value
	 * @return
	 */
	public static String filePathReplaceAll(String value) {
		String returnValue = value;
		if (returnValue == null || returnValue.trim().equals("")) {
			return "";
		}

		returnValue = returnValue.replaceAll("/", "");
		returnValue = returnValue.replaceAll("\\", "");
		returnValue = returnValue.replaceAll("\\.\\.", ""); // ..
		returnValue = returnValue.replaceAll("&", "");

		return returnValue;
	}

}