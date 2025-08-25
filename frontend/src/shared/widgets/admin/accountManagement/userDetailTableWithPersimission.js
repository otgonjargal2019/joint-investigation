import { useTranslations } from "next-intl";

import Button from "@/shared/components/button";
import SelectBox from "@/shared/components/form/select";

const UserDetailTableWithPermissionChange = ({ userInfo, register }) => {
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
            <div className="flex gap-2 w-[280px]">
              <SelectBox
                variant="adminForm"
                register={register}
                name="accountPermissions"
                options={[
                  { label: "수사관", value: "수사관" },
                  { label: "수사 관리자", value: "수사 관리자" },
                ]}
                showError={false}
              />
              <Button variant="gray2" size="adminForm">
                {t("change-authority")}
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
export default UserDetailTableWithPermissionChange;
