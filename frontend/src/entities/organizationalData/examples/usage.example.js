/**
 * Example usage of the useOrganizationalData hook
 * 
 * This hook is specifically designed for INV_ADMIN users to fetch
 * complete organizational data including:
 * 1. Current country organizational structure (headquarters → departments → investigators)
 * 2. INV_ADMIN users from other countries
 */

import { useOrganizationalData } from '@/entities/organizationalData';

// Example component using the hook
export const OrganizationalDataExample = () => {
  const {
    data: organizationalData,
    isLoading,
    isError,
    error,
    refetch
  } = useOrganizationalData();

  if (isLoading) {
    return <div>Loading organizational data...</div>;
  }

  if (isError) {
    return <div>Error loading data: {error?.message}</div>;
  }

  if (!organizationalData) {
    return <div>No organizational data available</div>;
  }

  const { currentCountryOrganization, foreignInvAdmins } = organizationalData;

  return (
    <div>
      <h2>Organizational Data</h2>
      
      {/* Current Country Organization */}
      <section>
        <h3>Current Country: {currentCountryOrganization.countryName} ({currentCountryOrganization.countryCode})</h3>
        
        {currentCountryOrganization.headquarters.map(hq => (
          <div key={hq.headquarterId}>
            <h4>{hq.headquarterName}</h4>
            
            {hq.departments.map(dept => (
              <div key={dept.departmentId}>
                <h5>{dept.departmentName}</h5>
                
                {dept.investigators.length > 0 ? (
                  <ul>
                    {dept.investigators.map(investigator => (
                      <li key={investigator.userId}>
                        {investigator.nameKr} ({investigator.nameEn}) - {investigator.email}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No investigators in this department</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Foreign INV_ADMINs */}
      <section>
        <h3>Foreign INV_ADMINs</h3>
        
        {foreignInvAdmins.map(country => (
          <div key={country.countryId}>
            <h4>{country.countryName} ({country.countryCode})</h4>
            
            {country.invAdmins.length > 0 ? (
              <ul>
                {country.invAdmins.map(admin => (
                  <li key={admin.userId}>
                    {admin.nameKr} ({admin.nameEn}) - {admin.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No INV_ADMINs in this country</p>
            )}
          </div>
        ))}
      </section>

      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};

// Example of accessing specific data
export const useOrganizationalDataSelectors = () => {
  const { data } = useOrganizationalData();

  // Selector functions to extract specific data
  const getCurrentCountryInvestigators = () => {
    if (!data?.currentCountryOrganization) return [];
    
    return data.currentCountryOrganization.headquarters.flatMap(hq =>
      hq.departments.flatMap(dept => dept.investigators)
    );
  };

  const getForeignInvAdminsByCountry = (countryCode) => {
    if (!data?.foreignInvAdmins) return [];
    
    const country = data.foreignInvAdmins.find(c => c.countryCode === countryCode);
    return country?.invAdmins || [];
  };

  const getAllDepartments = () => {
    if (!data?.currentCountryOrganization) return [];
    
    return data.currentCountryOrganization.headquarters.flatMap(hq => hq.departments);
  };

  return {
    data,
    getCurrentCountryInvestigators,
    getForeignInvAdminsByCountry,
    getAllDepartments
  };
};
