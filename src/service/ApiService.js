import authService from "@/service/v1/app/authService.js";
import accountService from "@/service/v1/app/accountService.js";
import userService from "@/service/v1/app/userService.js";
import userPermissionService from "@/service/v1/app/userPermissionService.js";
import userRoleService from "@/service/v1/app/userRoleService.js";
import componentService from "@/service/v1/app/componentService.js";

import countryService from "@/service/v1/admin/countryService.js";
import regionService from "@/service/v1/admin/regionService.js";
import districtService from "@/service/v1/admin/districtService.js";
import nationalityService from "@/service/v1/admin/nationalityService.js";
import positionService from "@/service/v1/admin/positionService.js";
import organizationService from "@/service/v1/admin/organizationService.js";
import logService from "@/service/v1/admin/logService.js"
import docSettingService from "@/service/v1/admin/docSettingService.js"
import serviceOrgService from "@/service/v1/admin/serviceOrgService.js"
import languageServiceAdmin from "@/service/v1/admin/languageService.js"
import universityServiceAdmin from "@/service/v1/admin/universityService.js"
import scheduleService from "@/service/v1/admin/scheduleService.js"
import workdayService from "@/service/v1/admin/workdayService.js"
import commandTempService from "@/service/v1/admin/commandTempService.js"
import specialityService from "@/service/v1/admin/specialityService.js"
import uploadService from '@/service/v1/admin/uploadService.js'
import holidayService from "@/service/v1/admin/holidayService.js"
import quoteService from "@/service/v1/admin/quoteService.js"

import confirmationService from "@/service/v1/hrm/confirmationService.js"
import departmentService from "@/service/v1/hrm/departmentService.js";
import departmentPositionService from "@/service/v1/hrm/departmentPositionService.js"
import workerService from "@/service/v1/hrm/workerService.js"
import passportService from "@/service/v1/hrm/passportService.js"
import photoService from "@/service/v1/hrm/photoService.js"
import phoneService from "@/service/v1/hrm/phoneService.js"
import languageService from "@/service/v1/hrm/languageService.js"
import relativeService from "@/service/v1/hrm/relativeService.js"
import universityService from "@/service/v1/hrm/universityService.js"
import olCareerService from "@/service/v1/hrm/olCareerService.js"
import partyService from "@/service/v1/hrm/partyService.js"
import militaryService from "@/service/v1/hrm/militaryService.js"
import academicTitleService from "@/service/v1/hrm/academicTitleService.js"
import academicDegreeService from "@/service/v1/hrm/academicDegreeService.js"
import vacationService from "@/service/v1/hrm/vacationService.js"
import timesheetDepartmentService from "@/service/v1/hrm/timesheetDepartmentService.js";
import timesheetService from '@/service/v1/hrm/timesheetService.js'
import timesheetWorkerService from '@/service/v1/hrm/timesheetWorkerService.js'
import dashboardService from "@/service/v1/hrm/dashboardService.js"
import medService from "@/service/v1/hrm/medService.js"
import reportService from "@/service/v1/hrm/reportService.js"
import organizationLeaderService from '@/service/v1/hrm/organizationLeaderService.js'

import documentService from "@/service/v1/docFlow/documentService.js"
import contractService from "@/service/v1/docFlow/contractService.js"
import commandService from "@/service/v1/docFlow/commandService.js"
import documentChatService from "@/service/v1/docFlow/documentChatService.js"
import documentFileService from "@/service/v1/docFlow/documentFileService.js"
import adContractService from "@/service/v1/docFlow/adContractService.js"
import applicationService from "@/service/v1/docFlow/applicationService.js"

import topicService from "@/service/v1/lms/topicService.js"
import topicFilesService from "@/service/v1/lms/topicFilesService.js"
import categoryService from "@/service/v1/lms/categoryService.js"
import categoryQuestionService from "@/service/v1/lms/categoryQuestionService.js"
import topicExamService from "@/service/v1/lms/topicExamService.js";
import topicExamResultService from "@/service/v1/lms/topicExamResultService.js";
import examDashboardService from '@/service/v1/lms/examDashboardService.js'
import workerExamService from '@/service/v1/lms/workerExamService.js'
import timesheetConfirmService from "@/service/v1/hrm/timesheetConfirmService.js";

import {turnstileTerminalService, turnstileBuildingService, turnstileOrganizationService} from './v1/turnstile'

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
    confirmationService,
    docSettingService,
    serviceOrgService,
    languageServiceAdmin,
    universityServiceAdmin,
    uploadService,
    scheduleService,
    workdayService,
    commandTempService,
    specialityService,
    commandService,
    documentChatService,
    topicService,
    topicExamService,
    topicExamResultService,
    examDashboardService,
    topicFilesService,
    workerExamService,
    categoryService,
    categoryQuestionService,
    relativeService,
    universityService,
    documentFileService,
    adContractService,
    olCareerService,
    partyService,
    militaryService,
    academicTitleService,
    academicDegreeService,
    holidayService,
    applicationService,
    vacationService,
    timesheetDepartmentService,
    timesheetService,
    timesheetWorkerService,
    timesheetConfirmService,
    dashboardService,
    medService,
    quoteService,
    reportService,
    organizationLeaderService,

    turnstileTerminalService,
    turnstileBuildingService,
    turnstileOrganizationService
}