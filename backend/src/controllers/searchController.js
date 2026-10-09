const { searchResumeService } = require("../services/searchService");

const searchResume = async(req,res) => {
    try{
        // const keyword = req.body.keyword;
        const keyword = req.query.q;
        const languages = req.query.languages ? req.query.languages.split(',') : [];
        // http://localhost:3000/api/resumes/search?q=English
        const data = await searchResumeService(keyword,languages)
        
        res.json({
            success:true,
            count:data.length,
            data
        })
    }catch(err){
        res.status(500).json({
            erro:err.message
        })
    }
}

module.exports = {searchResume};