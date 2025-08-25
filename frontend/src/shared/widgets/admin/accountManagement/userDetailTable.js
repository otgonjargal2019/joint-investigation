import { useTranslations } from "next-intl";

const UserDetailTable = ({ userInfo }) => {
  const t = useTranslations();

  return (
    <table className="border border-color-32 text-[18px] w-fit">
      <tbody>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.id")}
          </th>
          <td
            colSpan="2"
            className="w-[506px] bg-white border border-color-32 text-black font-normal py-3 px-4"
          >
            {userInfo.id}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.name")}
          </th>
          <td
            colSpan="2"
            className="w-[506px] bg-white border border-color-32 text-black font-normal py-3 px-4"
          >
            {userInfo.name}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.nation")}
          </th>
          <td
            colSpan="2"
            className="w-[506px] bg-white border border-color-32 text-black font-normal py-3 px-4"
          >
            {userInfo.nation}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.affiliation")}
          </th>
          <td className="w-[234px] bg-white border border-color-32 text-black font-normal py-3 px-4">
            {userInfo.unit}
          </td>
          <td className="w-[273px] bg-white border border-color-32 text-black font-normal py-3 px-4">
            {userInfo.team}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.contact-info")}
          </th>
          <td
            colSpan="2"
            className="w-[506px] bg-white border border-color-32 text-black font-normal py-3 px-4"
          >
            {userInfo.contactInfo}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.email")}
          </th>
          <td
            colSpan="2"
            className="w-[506px] bg-white border border-color-32 text-black font-normal py-3 px-4"
          >
            {userInfo.email}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.account-permissions")}
          </th>
          <td
            colSpan="2"
            className="w-[506px] bg-white border border-color-32 text-black font-normal py-3 px-4"
          >
            {userInfo.accountPermissions}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
export default UserDetailTable;
