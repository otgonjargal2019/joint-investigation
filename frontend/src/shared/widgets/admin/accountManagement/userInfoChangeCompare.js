import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

const UserInfoChangeCompare = ({ newUserInfo, userInfo }) => {
  const t = useTranslations();
  return (
    <div className="flex gap-4 items-center">
      <table className="border border-color-32 text-[18px] w-fit">
        <thead>
          <tr className="h-[54px]">
            <th className="bg-color-57 text-color-13 font-bold" colSpan={3}>
              {t("form.before-change")}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.id")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-color-45 font-normal px-4"
            >
              {userInfo.id}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.name")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-color-45 font-normal px-4"
            >
              {userInfo.name}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.nation")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-color-45 font-normal px-4"
            >
              {userInfo.nation}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.affiliation")}
            </th>
            <td className="w-[234px] bg-white border border-color-32 text-black font-normal px-4">
              {userInfo.unit}
            </td>
            <td className="w-[273px] bg-white border border-color-32 text-black font-normal px-4">
              {userInfo.team}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.contact-info")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-black font-normal px-4"
            >
              {userInfo.contactInfo}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.email")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-black font-normal px-4"
            >
              {userInfo.email}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.account-permissions")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-black font-normal px-4"
            >
              {userInfo.accountPermissions}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex -space-x-7">
        <ChevronRight
          size={50}
          className="text-color-8"
          style={{ opacity: 0.3 }}
        />
        <ChevronRight
          size={50}
          className="text-color-8"
          style={{ opacity: 0.6 }}
        />
        <ChevronRight
          size={50}
          className="text-color-8"
          style={{ opacity: 0.9 }}
        />
      </div>
      <table className="border border-color-32 text-[18px] w-fit">
        <thead>
          <tr className="h-[54px]">
            <th className="bg-color-57 text-color-13 font-bold" colSpan={3}>
              {t("form.after-change")}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.id")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-color-45 font-normal px-4"
            >
              {newUserInfo.id}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.name")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-color-45 font-normal px-4"
            >
              {newUserInfo.name}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.nation")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-color-45 font-normal px-4"
            >
              {newUserInfo.nation}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.affiliation")}
            </th>
            <td className="w-[234px] bg-white border border-color-32 text-black font-normal px-4">
              {newUserInfo.unit}
            </td>
            <td className="w-[273px] bg-white border border-color-32 text-black font-normal px-4">
              {newUserInfo.team}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.contact-info")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-black font-normal px-4"
            >
              {newUserInfo.contactInfo}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.email")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-black font-normal px-4"
            >
              {newUserInfo.email}
            </td>
          </tr>
          <tr className="h-[54px]">
            <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold text-center">
              {t("form.account-permissions")}
            </th>
            <td
              colSpan="2"
              className="w-[506px] bg-white border border-color-32 text-black font-normal px-4"
            >
              {newUserInfo.accountPermissions}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserInfoChangeCompare;
