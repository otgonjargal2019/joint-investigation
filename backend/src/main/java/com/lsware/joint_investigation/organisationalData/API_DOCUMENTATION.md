# Organizational Data API for INV_ADMIN

This document describes the combined API created for INV_ADMIN role users to access complete organizational data in a tree structure.

## API Overview

The API is restricted to **INV_ADMIN** role only and requires JWT authentication. It provides a complete view of both the current user's country organizational structure and INV_ADMIN users from other countries.

### Combined Organizational Data API

**Endpoint:** `GET /api/organizational-data/complete-tree`

**Description:** Returns complete organizational data including:
1. Current user's country organizational structure (headquarters, departments, and INVESTIGATOR users)
2. INV_ADMIN users from all other countries

**Authorization:** `@PreAuthorize("hasRole('INV_ADMIN')")`

**Response Structure:**
```json
{
  "currentCountryOrganization": {
    "countryId": 1,
    "countryUuid": "uuid-string",
    "countryName": "South Korea",
    "countryCode": "KR",
    "headquarters": [
      {
        "headquarterId": 1,
        "headquarterUuid": "uuid-string",
        "headquarterName": "Seoul Headquarters",
        "departments": [
          {
            "departmentId": 1,
            "departmentUuid": "uuid-string", 
            "departmentName": "Cyber Crime Investigation",
            "investigators": [
              {
                "userId": "uuid-string",
                "loginId": "investigator1",
                "nameKr": "김수사관",
                "nameEn": "Kim Investigator",
                "email": "investigator1@example.com",
                "phone": "010-1234-5678",
                "role": "INVESTIGATOR",
                "status": "ACTIVE"
              }
            ]
          }
        ]
      }
    ]
  },
  "foreignInvAdmins": [
    {
      "countryId": 2,
      "countryUuid": "uuid-string",
      "countryName": "Thailand",
      "countryCode": "TH",
      "invAdmins": [
        {
          "userId": "uuid-string",
          "loginId": "admin_th_1",
          "nameKr": "태국관리자",
          "nameEn": "Thailand Admin",
          "email": "admin@thailand.gov.th",
          "phone": "+66-xxx-xxxx",
          "role": "INV_ADMIN",
          "status": "ACTIVE"
        }
      ]
    },
    {
      "countryId": 3,
      "countryUuid": "uuid-string",
      "countryName": "Japan",
      "countryCode": "JP",
      "invAdmins": [
        {
          "userId": "uuid-string",
          "loginId": "admin_jp_1",
          "nameKr": "일본관리자",
          "nameEn": "Japan Admin",
          "email": "admin@japan.gov.jp",
          "phone": "+81-xxx-xxxx",
          "role": "INV_ADMIN",
          "status": "ACTIVE"
        }
      ]
    }
  ]
}
```

## Implementation Details

### Architecture

1. **Controller Layer**: `OrganizationalDataController`
   - Handles HTTP requests and security validation
   - Validates user role and authentication
   - Returns appropriate HTTP status codes
   - Single endpoint for complete organizational data

2. **Service Layer**: `OrganizationalDataService`
   - Contains business logic for building tree structures
   - Processes organizational data and user information
   - Handles data mapping and transformation
   - Combines current country and foreign admin data

3. **Repository Layer**: `OrganizationalDataRepository`
   - Extends `SimpleJpaRepository` for basic CRUD operations
   - Uses QueryDSL for complex queries
   - Provides filtered data access methods

4. **DTO Layer**: Multiple DTOs for structured responses
   - `CombinedOrganizationalDataDto`: Root wrapper for complete response
   - `CountryOrganizationTreeDto`: Current country organizational structure
   - `HeadquarterTreeNodeDto`: Headquarter level nodes
   - `DepartmentTreeNodeDto`: Department level nodes
   - `ForeignInvAdminTreeDto`: Foreign country admin structure
   - `UserTreeNodeDto`: User information nodes

### Security Features

- **Role-based Access Control**: Only `INV_ADMIN` role can access the API
- **JWT Authentication**: Required for all requests  
- **Double Role Verification**: Controller verifies role at runtime
- **Active User Filter**: Only returns users with `ACTIVE` status

### Data Flow

1. **Authentication**: JWT token validates user identity
2. **Authorization**: Spring Security checks INV_ADMIN role
3. **User Lookup**: Controller fetches full user details from database
4. **Role Verification**: Double-check user has INV_ADMIN role
5. **Service Execution**: Business logic processes organizational data
6. **Tree Building**: Service assembles hierarchical structure for both current country and foreign admins
7. **Response**: Combined structured JSON returned to client

### Error Handling

- **403 Forbidden**: User doesn't have INV_ADMIN role
- **404 Not Found**: User not found in database
- **400 Bad Request**: Invalid country ID or missing data
- **500 Internal Server Error**: Unexpected system errors

## Usage Examples

### JavaScript/Frontend Usage

```javascript
// Combined API: Get complete organizational data
const getCompleteOrganizationalData = async () => {
  try {
    const response = await fetch('/api/organizational-data/complete-tree', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    // Access current country organization
    const currentCountry = data.currentCountryOrganization;
    console.log('Current Country:', currentCountry.countryName);
    console.log('Headquarters:', currentCountry.headquarters);
    
    // Access foreign INV_ADMINs
    const foreignAdmins = data.foreignInvAdmins;
    foreignAdmins.forEach(country => {
      console.log(`${country.countryName} has ${country.invAdmins.length} INV_ADMINs`);
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching complete organizational data:', error);
  }
};
```

### Response Data Structure Access

```javascript
// Example of accessing the combined data
const organizationalData = await getCompleteOrganizationalData();

// Current country investigators
organizationalData.currentCountryOrganization.headquarters.forEach(hq => {
  hq.departments.forEach(dept => {
    console.log(`Department: ${dept.departmentName}`);
    dept.investigators.forEach(inv => {
      console.log(`  - ${inv.nameKr} (${inv.email})`);
    });
  });
});

// Foreign INV_ADMINs
organizationalData.foreignInvAdmins.forEach(country => {
  console.log(`Country: ${country.countryName}`);
  country.invAdmins.forEach(admin => {
    console.log(`  - ${admin.nameKr} (${admin.email})`);
  });
});
```

## Database Dependencies

This API depends on the following database tables:
- `users`: User information and roles
- `country`: Country master data
- `headquarter`: Headquarter information
- `department`: Department information

Ensure all foreign key relationships are properly maintained between Users and organizational entities (countryId, headquarterId, departmentId).

## Benefits of the Combined API

1. **Reduced Network Calls**: Single request instead of two separate API calls
2. **Consistent Data State**: Both datasets retrieved atomically
3. **Better Performance**: Reduced overhead from authentication and connection setup
4. **Simplified Frontend Logic**: One endpoint to manage instead of two
5. **Cleaner Architecture**: Single responsibility for complete organizational view
