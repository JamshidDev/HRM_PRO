
import authService from "@/service/v1/app/authService.js";
import accountService from "@/service/v1/app/accountService.js";
import userService from "@/service/v1/app/userService.js";
import userPermissionService from "@/service/v1/app/userPermissionService.js";
import userRoleService from "@/service/v1/app/userRoleService.js";
import countryService from "@/service/v1/admin/countryService.js";
import regionService from "@/service/v1/admin/regionService.js";
import districtService from "@/service/v1/admin/districtService.js";
import nationalityService from "@/service/v1/admin/nationalityService.js";
import positionService from "@/service/v1/admin/positionService.js";
import organizationService from "@/service/v1/admin/organizationService.js";
import componentService from "@/service/v1/app/componentService.js";
import departmentService from "@/service/v1/hrm/departmentService.js";
import departmentPositionService from "@/service/v1/hrm/departmentPositionService.js"
import workerService from "@/service/v1/hrm/workerService.js"
import passportService from "@/service/v1/hrm/passportService.js"
import photoService from "@/service/v1/hrm/photoService.js"
import phoneService from "@/service/v1/hrm/phoneService.js"
import languageService from "@/service/v1/hrm/languageService.js"
import documentService from "@/service/v1/docFlow/documentService.js"
import contractService from "@/service/v1/docFlow/contractService.js"
import logService from "@/service/v1/admin/logService.js"
export default {
    authService,
    accountService,
    userService,
    userPermissionService,
    userRoleService,
    countryService,
    regionService,
    districtService,
    nationalityService,
    positionService,
    organizationService,
    componentService,
    departmentService,
    departmentPositionService,
    workerService,
    documentService,
    contractService,
    logService,
    passportService,
    photoService,
    phoneService,
    languageService,
}