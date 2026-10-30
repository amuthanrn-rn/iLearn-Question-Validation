import express from "express";
import { Op } from "sequelize";
import models from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.subject && req.query.subject !== "All") {
      where.subject = req.query.subject;
    }
    if (req.query.exam && req.query.exam !== "All") {
      where.exam = req.query.exam;
    }
    if (req.query.chapter && req.query.chapter !== "All") {
      where.chapter = req.query.chapter;
    }
    if (req.query.questionType && req.query.questionType !== "All") {
      where.category = req.query.questionType;
    }
    if (req.query.review_status && req.query.review_status !== "All") {
      where.review_status = req.query.review_status;
    }
    if (req.query.publication_status && req.query.publication_status !== "All") {
      where[Op.or] = [
        { current_publication_status: req.query.publication_status },
        { publication_status_at_screening: req.query.publication_status }
      ];
    }

    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      if (!isNaN(searchTerm)) {
        where[Op.or] = [
          { question: { [Op.iLike]: "%" + searchTerm + "%" } },
          { qid: searchTerm }
        ];
      } else {
        where.question = { [Op.iLike]: "%" + searchTerm + "%" };
      }
    } else if (req.query.qid) {
      where.qid = req.query.qid;
    }

    if (req.query.class && req.query.class !== "All") {
      if (req.query.class === "1 PU" || req.query.class === "Class XI") {
        where[Op.and] = [
          ...(where[Op.and] || []),
          { chapter: { [Op.regexp]: "^[1-5]\\." } }
        ];
      } else if (req.query.class === "2 PU" || req.query.class === "Class XII") {
        where[Op.and] = [
          ...(where[Op.and] || []),
          { chapter: { [Op.regexp]: "^[6-9]\\.|^1[0-6]\\." } }
        ];
      }
    }

    const { count, rows } = await models.ScreeningFindingsImport.findAndCountAll({
      where,
      limit,
      offset,
      order: [["qid", "ASC"]]
    });

    res.json({
      questions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      limit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const total = await models.ScreeningFindingsImport.count();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/meta/filters", async (req, res) => {
  try {
    const subjects = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("subject")), "subject"]],
      where: { subject: { [Op.ne]: null } },
      raw: true
    });
    const exams = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("exam")), "exam"]],
      where: { exam: { [Op.ne]: null } },
      raw: true
    });
    const chapters = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("chapter")), "chapter"]],
      where: { chapter: { [Op.ne]: null } },
      order: [[models.ScreeningFindingsImport.sequelize.col("chapter"), "ASC"]],
      raw: true
    });
    const questionTypes = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("category")), "category"]],
      where: { category: { [Op.ne]: null } },
      raw: true
    });
    const reviewStatuses = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("review_status")), "review_status"]],
      where: { review_status: { [Op.ne]: null } },
      raw: true
    });
    const publicationStatuses = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("current_publication_status")), "current_publication_status"]],
      where: { current_publication_status: { [Op.ne]: null } },
      raw: true
    });

    res.json({
      subjects: subjects.map(s => s.subject).filter(Boolean).sort(),
      exams: exams.map(e => e.exam).filter(Boolean).sort(),
      chapters: chapters.map(c => c.chapter).filter(Boolean).sort(),
      questionTypes: questionTypes.map(q => q.category).filter(Boolean).sort(),
      reviewStatuses: reviewStatuses.map(r => r.review_status).filter(Boolean).sort(),
      publicationStatuses: publicationStatuses.map(p => p.current_publication_status).filter(Boolean).sort(),
      classes: ["1 PU (Class XI)", "2 PU (Class XII)"]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/meta/chapters", async (req, res) => {
  try {
    const where = { chapter: { [Op.ne]: null } };
    if (req.query.subject && req.query.subject !== "All") {
      where.subject = req.query.subject;
    }
    if (req.query.class && req.query.class !== "All") {
      if (req.query.class === "1 PU" || req.query.class === "Class XI") {
        where[Op.and] = [
          ...(where[Op.and] || []),
          { chapter: { [Op.regexp]: "^[1-5]\\." } }
        ];
      } else if (req.query.class === "2 PU" || req.query.class === "Class XII") {
        where[Op.and] = [
          ...(where[Op.and] || []),
          { chapter: { [Op.regexp]: "^[6-9]\\.|^1[0-6]\\." } }
        ];
      }
    }
    const chapters = await models.ScreeningFindingsImport.findAll({
      attributes: [[models.ScreeningFindingsImport.sequelize.fn("DISTINCT", models.ScreeningFindingsImport.sequelize.col("chapter")), "chapter"]],
      where,
      order: [[models.ScreeningFindingsImport.sequelize.col("chapter"), "ASC"]],
      raw: true
    });
    res.json({ chapters: chapters.map(c => c.chapter).filter(Boolean) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:qid", async (req, res) => {
  try {
    const question = await models.ScreeningFindingsImport.findByPk(req.params.qid);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
