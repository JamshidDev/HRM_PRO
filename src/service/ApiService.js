import authService from '@/service/v1/app/authService.js'
import publicService from '@/service/v1/app/publicService.js'
import accountService from '@/service/v1/app/accountService.js'
import usefulService from '@/service/v1/app/usefulService.js'
import userService from '@/service/v1/app/userService.js'
import userPermissionService from '@/service/v1/app/userPermissionService.js'
import userRoleService from '@/service/v1/app/userRoleService.js'
import componentService from '@/service/v1/app/componentService.js'
import aiConversationService from '@/service/v1/app/aiConversationService.js'

import countryService from '@/service/v1/admin/countryService.js'
import regionService from '@/service/v1/admin/regionService.js'
import districtService from '@/service/v1/admin/districtService.js'
import nationalityService from '@/service/v1/admin/nationalityService.js'
import positionService from '@/service/v1/admin/positionService.js'
import organizationService from '@/service/v1/admin/organizationService.js'
import logService from '@/service/v1/admin/logService.js'
import docSettingService from '@/service/v1/admin/docSettingService.js'
import serviceOrgService from '@/service/v1/admin/serviceOrgService.js'
import languageServiceAdmin from '@/service/v1/admin/languageService.js'
import universityServiceAdmin from '@/service/v1/admin/universityService.js'
import scheduleService from '@/service/v1/admin/scheduleService.js'
import workdayService from '@/service/v1/admin/workdayService.js'
import commandTempService from '@/service/v1/admin/commandTempService.js'
import specialityService from '@/service/v1/admin/specialityService.js'
import uploadService from '@/service/v1/admin/uploadService.js'
import holidayService from '@/service/v1/admin/holidayService.js'
import quoteService from '@/service/v1/admin/quoteService.js'
import telegramService from '@/service/v1/admin/telegramService.js'
import instructionService from '@/service/v1/admin/instructionService.js'
import mobileUserService from '@/service/v1/admin/mobileUserService.js'
import vacancyApproveService from '@/service/v1/admin/vacancyApproveService.js'
import integrationLogService from '@/service/v1/admin/integrationLogService.js'
import integrationClientsService from '@/service/v1/admin/integrationClientsService.js'
import lateWorkersReportService from '@/service/v1/admin/lateWorkersReportService.js'
import lateWorkersHalfYearReportService from '@/service/v1/admin/lateWorkersHalfYearReportService.js'
import relativesShortageReportService from '@/service/v1/admin/relativesShortageReportService.js'

import confirmationService from '@/service/v1/hrm/confirmationService.js'
import departmentService from '@/service/v1/hrm/departmentService.js'
import departmentPositionService from '@/service/v1/hrm/departmentPositionService.js'
import workerService from '@/service/v1/hrm/workerService.js'
import passportService from '@/service/v1/hrm/passportService.js'
import foreignPassportService from '@/service/v1/hrm/foreignPassportService.js'
import photoService from '@/service/v1/hrm/photoService.js'
import phoneService from '@/service/v1/hrm/phoneService.js'
import languageService from '@/service/v1/hrm/languageService.js'
import relativeService from '@/service/v1/hrm/relativeService.js'
import workerDisabilityService from '@/service/v1/hrm/workerDisabilityService.js'
import universityService from '@/service/v1/hrm/universityService.js'
import olCareerService from '@/service/v1/hrm/olCareerService.js'
import partyService from '@/service/v1/hrm/partyService.js'
import militaryService from '@/service/v1/hrm/militaryService.js'
import academicTitleService from '@/service/v1/hrm/academicTitleService.js'
import academicDegreeService from '@/service/v1/hrm/academicDegreeService.js'
import vacationService from '@/service/v1/hrm/vacationService.js'
import timesheetDepartmentService from '@/service/v1/hrm/timesheetDepartmentService.js'
import timesheetService from '@/service/v1/hrm/timesheetService.js'
import timesheetWorkerService from '@/service/v1/hrm/timesheetWorkerService.js'
import dashboardService from '@/service/v1/hrm/dashboardService.js'
import medService from '@/service/v1/hrm/medService.js'
import reportService from '@/service/v1/hrm/reportService.js'
import organizationLeaderService from '@/service/v1/hrm/organizationLeaderService.js'
import exportService from '@/service/v1/hrm/exportService.js'
import documentArchiveService from '@/service/v1/hrm/documentArchiveService.js'
import businessTrip from '@/service/v1/hrm/businessTrip.js'
import incentiveService from '@/service/v1/hrm/incentiveService.js'
import punishmentService from '@/service/v1/hrm/punishmentService.js'
import medInspectionService from '@/service/v1/hrm/medInspectionService.js'
import polyclinicService from '@/service/v1/hrm/polyclinicService.js'
import vacancyService from '@/service/v1/hrm/vacancyService.js'
import pensionerService from '@/service/v1/hrm/pensionerService.js'
import specialReportService from './v1/hrm/specialReportService'
import structureReportService from '@/service/v1/hrm/structureReportService.js'
import departmentLocationService from '@/service/v1/hrm/departmentLocationService.js'

import documentService from '@/service/v1/docFlow/documentService.js'
import contractService from '@/service/v1/docFlow/contractService.js'
import commandService from '@/service/v1/docFlow/commandService.js'
import documentChatService from '@/service/v1/docFlow/documentChatService.js'
import documentFileService from '@/service/v1/docFlow/documentFileService.js'
import adContractService from '@/service/v1/docFlow/adContractService.js'
import applicationService from '@/service/v1/docFlow/applicationService.js'
import confVacationScheduleService from '@/service/v1/docFlow/vacationScheduleService.js'
import confCertificateService from '@/service/v1/docFlow/confCertificateService.js'
import confStaffingApprovalService from '@/service/v1/docFlow/confStaffingApprovalService.js'
import confirmationReportService from '@/service/v1/docFlow/confirmationReportService.js'

import topicService from '@/service/v1/attestation/topicService.js'
import examVideoService from '@/service/v1/attestation/examVideoService.js'
import topicFilesService from '@/service/v1/attestation/topicFilesService.js'
import categoryService from '@/service/v1/attestation/categoryService.js'
import categoryQuestionService from '@/service/v1/attestation/categoryQuestionService.js'
import topicExamService from '@/service/v1/attestation/topicExamService.js'
import topicExamResultService from '@/service/v1/attestation/topicExamResultService.js'
import examDashboardService from '@/service/v1/attestation/examDashboardService.js'
import workerExamService from '@/service/v1/attestation/workerExamService.js'
import timesheetConfirmService from '@/service/v1/hrm/timesheetConfirmService.js'
import vacationScheduleService from '@/service/v1/hrm/vacationScheduleService.js'

import learningCenterService from '@/service/v1/lms/learningCenterService.js'
import directionService from '@/service/v1/lms/directionService.js'
import specializationService from '@/service/v1/lms/specializationService.js'
import subjectService from '@/service/v1/lms/subjectService.js'
import eduPlanService from '@/service/v1/lms/eduPlanService.js'
import teacherService from '@/service/v1/lms/teacherService.js'
import lmsWorkerService from '@/service/v1/lms/workerService.js'
import lmsGroupService from '@/service/v1/lms/groupService.js'
import lmsLessonService from '@/service/v1/lms/lessonService.js'
import lmsExamService from '@/service/v1/lms/examService.js'
import teacherLessonService from '@/service/v1/lms/teacherLessonService.js'
import listenerService from '@/service/v1/lms/listenerService.js'
import certificateService from '@/service/v1/lms/certificateService.js'

import notificationService from '@/service/v1/chat/notificationService.js'
import congratulationService from '@/service/v1/chat/congratulationService.js'
import newsCategoryService from '@/service/v1/chat/newsCategoryService.js'
import newsService from '@/service/v1/chat/newsService.js'


import {
  turnstileTerminalService,
  turnstileBuildingService,
  turnstileOrganizationService,
  turnstileTerminalUserService,
  turnstileWorkDurationService,
  turnstileHikCentralAccessService,
  turnstileHikCentralWorkerService,
  hcServerService,
  eventService,
  telegramUserService,
  workerImageService,
  devicesService,
  syncLogService,
  turnstileDashboardService,
  userImageLogsService,
  invalidUserService,
  eventV2Service,
  shiftTypeService,
  scheduleService as workerScheduleService,
  approveService
} from './v1/turnstile'

import accountantService from './v1/accountant/accountantService.js'
import monthReportService from './v1/accountant/monthReportService.js'
import taxFourService from './v1/accountant/taxFourService.js'
import taxFiveService from './v1/accountant/taxFiveService.js'
import accDashboardService from './v1/accountant/accDashboardService.js'
import salaryCategoryService from './v1/accountant/salaryCategoryService.js'
import salaryReportService from './v1/accountant/salaryReportService.js'
import pensionService from './v1/accountant/pensionService.js'
import staffApprovalService from './v1/accountant/staffApprovalService.js'

import expiredHealthService from './v1/hospital/expiredHealthService.js'
import ticketService from './v1/hospital/ticketService.js'
import medWorkerService from './v1/hospital/medWorkerService.js'

export default {
  publicService,
  shiftTypeService,
  authService,
  accountService,
  userService,
  usefulService,
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
  foreignPassportService,
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
  workerDisabilityService,
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
  telegramService,
  instructionService,
  medInspectionService,
  polyclinicService,
  pensionerService,
  specialReportService,
  reportService,
  aiConversationService,
  organizationLeaderService,
  exportService,
  documentArchiveService,
  vacationScheduleService,
  businessTrip,
  incentiveService,
  turnstileTerminalService,
  turnstileBuildingService,
  turnstileOrganizationService,
  turnstileTerminalUserService,
  turnstileWorkDurationService,
  turnstileHikCentralAccessService,
  turnstileHikCentralWorkerService,
  hcServerService,
  punishmentService,
  vacancyService,
  eventService,
  telegramUserService,
  workerImageService,
  devicesService,
  learningCenterService,
  directionService,
  specializationService,
  subjectService,
  eduPlanService,
  teacherService,
  monthReportService,
  accountantService,
  taxFourService,
  taxFiveService,
  accDashboardService,
  salaryCategoryService,
  salaryReportService,
  pensionService,
  expiredHealthService,
  ticketService,
  medWorkerService,
  lmsWorkerService,
  lmsGroupService,
  lmsLessonService,
  syncLogService,
  teacherLessonService,
  listenerService,
  lmsExamService,
  examVideoService,
  turnstileDashboardService,
  userImageLogsService,
  invalidUserService,
  eventV2Service,
  workerScheduleService,
  notificationService,
  confVacationScheduleService,
  certificateService,
  confCertificateService,
  approveService,
  staffApprovalService,
  confStaffingApprovalService,
  congratulationService,
  newsCategoryService,
  newsService,
  mobileUserService,
  vacancyApproveService,
  structureReportService,
  confirmationReportService,
  departmentLocationService,
  integrationLogService,
  integrationClientsService,
  lateWorkersReportService,
  lateWorkersHalfYearReportService,
  relativesShortageReportService,
}
