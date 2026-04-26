const Resume = require('../models/Resume');
const geminiService = require('../services/geminiService');
const { extractTextFromPDF } = require('../services/pdfService');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file provided.' });
    const { targetRole } = req.body;

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      targetRole: targetRole || '',
      status: 'processing',
    });

    try {

      const extractedText = await extractTextFromPDF(req.file.path);
      console.log('resume extract text',extractedText);
      resume.extractedText = Array.isArray(extractedText) 
       ? extractedText.join("\n") 
       : extractedText;


      const analysis = await geminiService.analyzeResume(extractedText, targetRole || '');

      resume.analysis = {
        overallScore: analysis.overallScore,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        suggestions: analysis.suggestions || [],
        keywordMatch: analysis.keywordMatch || { found: [], missing: [] },
        formattingScore: analysis.formattingScore,
        contentScore: analysis.contentScore,
        experienceScore: analysis.experienceScore,
      };
      resume.status = 'analyzed';
    } catch (analysisErr) {
      console.error('Resume analysis failed:', analysisErr.message);
      resume.status = 'failed';
    }

  await resume.save();

    // await resume.save();
    console.log(resume);
  
    res.status(201).json(resume);
  } catch (error) {
    console.log('error hai::',error.messages)
    res.status(500).json({ message: 'Failed to upload resume.', error: error.message });
  }
};  

exports.getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).select('-extractedText').sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resumes.', error: error.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resume.', error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    const fs = require('fs');
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
    res.json({ message: 'Resume deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resume.', error: error.message });
  }
};
