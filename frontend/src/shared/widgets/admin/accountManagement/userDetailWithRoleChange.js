import { useTranslations } from "next-intl";

import Button from "@/shared/components/button";
import SelectBox from "@/shared/components/form/select";
import { ROLES } from "@/shared/dictionary";

const UserDetailWithRoleChange = ({
  userInfo,
  register,
  onSubmit,
  isButtonDisabled,
}) => {
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
            {userInfo.loginId}
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
            {userInfo.nameKr || userInfo.nameEn}
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
            {userInfo.countryName}
          </td>
        </tr>
        <tr>
          <th className="w-[150px] bg-color-72 border border-color-32 text-color-13 font-bold py-3 text-center">
            {t("form.affiliation")}
          </th>
          <td className="w-[234px] bg-white border border-color-32 text-black font-normal py-3 px-4">
            {userInfo.headquarterName}
          </td>
          <td className="w-[273px] bg-white border border-color-32 text-black font-normal py-3 px-4">
            {userInfo.departmentName}
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
            {userInfo.phone}
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
                name="role"
                options={[
                  { label: "", value: "" },
                  { label: "수사관", value: ROLES.INVESTIGATOR },
                  { label: "수사 관리자", value: ROLES.INV_ADMIN },
                ]}
                showError={false}
              />
              <Button
                variant="yellow"
                size="adminForm"
                onClick={onSubmit}
                disabled={isButtonDisabled}
              >
                {t("change-authority")}
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
export default UserDetailWithRoleChange;
