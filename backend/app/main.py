import os
import io
import zipfile
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.routers import policy, deletion, breach, hub

app = FastAPI(
    title="Guardra Privacy Suite API",
    description="Backend engine for privacy policy scoring (DPDP/GDPR/CCPA), automated deletion requests, k-anonymity breach monitoring, and privacy hub.",
    version="1.0.0"
)

# Enable CORS for frontend and browser extensions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(policy.router)
app.include_router(deletion.router)
app.include_router(breach.router)
app.include_router(hub.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Guardra Privacy Suite Backend",
        "version": "1.0.0",
        "features": [
            "DPDP Act 2023 / GDPR Compliance Scorer",
            "Real-time Policy NLP Rubric Analyzer",
            "K-Anonymity HIBP Breach Checker",
            "Statutory Deletion Request Generator & PDF Builder",
            "One-Place Privacy Control Hub"
        ]
    }

@app.get("/api/extension/download")
async def download_extension_zip():
    """Package the /extension directory into a zip file and stream it for direct installation"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ext_dir = os.path.join(base_dir, "extension")
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(ext_dir):
            for file in files:
                abs_file = os.path.join(root, file)
                rel_file = os.path.relpath(abs_file, ext_dir)
                zf.write(abs_file, rel_file)
                
    zip_buffer.seek(0)
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=guardra-extension.zip"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
