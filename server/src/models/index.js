import DBConnection from './DBConnection.js';
import DBMapping from './DBMapping.js';
import ScreeningFindingsImport from './ScreeningFindingsImport.js';
import ScreeningJob from './ScreeningJob.js';
import ScreeningResult from './ScreeningResult.js';
import ScreeningFailure from './ScreeningFailure.js';
import PublicationChangeRequest from './PublicationChangeRequest.js';
import AuditLog from './AuditLog.js';

const models = {
  DBConnection,
  DBMapping,
  ScreeningFindingsImport,
  ScreeningJob,
  ScreeningResult,
  ScreeningFailure,
  PublicationChangeRequest,
  AuditLog
};

export default models;
