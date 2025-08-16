import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Video } from '@/hooks/useVideos';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (videos: Omit<Video, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
}

interface CSVRow {
  [key: string]: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// Automatic column mapping from CSV headers to database fields
const COLUMN_MAPPING: Record<string, string> = {
  'Image': 'image_url',
  'URL': 'video_url',
  'Title': 'title',
  'Date': 'published_date',
  'Link': 'external_link',
  'Type': 'video_type',
  'Views': 'views',
  'Likes': 'likes',
  'Comments': 'comments',
  'Shares': 'shares',
  'Reach': 'reach',
  'Duration': 'duration_seconds',
  'Engagement': 'engagement_rate',
  'Full video watched rate': 'full_video_watch_rate',
  'Total time watched seconds': 'total_time_watched',
  'Avg. time watched seconds': 'avg_time_watched',
  'For You': 'traffic_for_you',
  'Follow': 'traffic_follow',
  'Hashtag': 'traffic_hashtag',
  'Sound': 'traffic_sound',
  'Personal profile': 'traffic_profile',
  'Search': 'traffic_search',
  'Saves': 'saves',
  'New Followers': 'new_followers',
  'Guion': 'guion',
  'Hook': 'hook',
  // NEW FIELDS - Theme, CTA, and Editing Style
  'Theme': 'video_theme',
  'Tema': 'video_theme',  // Spanish support
  'CTA': 'cta_type',
  'Editing Style': 'editing_style',
  'Estilo de Edicion': 'editing_style',  // Spanish support
};

export const CSVImportModal = ({ open, onClose, onImport }: CSVImportModalProps) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const resetModal = () => {
    setStep('upload');
    setCsvData([]);
    setFileName('');
    setImportProgress(0);
    setImportResult(null);
    setIsDragOver(false);
  };

  const parseValue = (value: string, field: string): any => {
    if (!value || value.trim() === '') return null;
    
    const numericFields = ['views', 'likes', 'comments', 'shares', 'reach', 'duration_seconds', 
                          'total_time_watched', 'traffic_for_you', 'traffic_follow', 
                          'traffic_hashtag', 'traffic_sound', 'traffic_profile', 
                          'traffic_search', 'saves', 'new_followers'];
    
    const percentageFields = ['engagement_rate', 'full_video_watch_rate'];
    const decimalFields = ['avg_time_watched'];
    
    if (numericFields.includes(field)) {
      const parsed = parseInt(value.replace(/[,\s%]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    
    if (percentageFields.includes(field)) {
      const parsed = parseFloat(value.replace('%', ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    
    if (decimalFields.includes(field)) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    if (field === 'published_date') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
    }
    
    return value.trim();
  };

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV parsing error",
            description: "There was an error parsing your CSV file",
            variant: "destructive",
          });
          return;
        }

        const data = results.data as CSVRow[];
        
        if (data.length === 0) {
          toast({
            title: "Empty CSV file",
            description: "Please upload a CSV file with data",
            variant: "destructive",
          });
          return;
        }
        
        setCsvData(data);
        setStep('preview');
      },
      error: (error) => {
        toast({
          title: "File upload error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const processedVideos: any[] = [];
      
      csvData.forEach((row, index) => {
        try {
          const video: any = {};
          
          // DEBUG: Log raw CSV data for first row
          if (index === 0) {
            console.log('Raw CSV columns detected:', Object.keys(row));
            console.log('Raw first row data:', row);
          }
          
          // Apply automatic column mapping
          Object.entries(COLUMN_MAPPING).forEach(([csvColumn, dbField]) => {
            if (row[csvColumn] !== undefined) {
              const value = parseValue(row[csvColumn], dbField);
              if (value !== null) {
                video[dbField] = value;
              }
              
              // DEBUG: Log new field mappings
              if (['video_theme', 'cta_type', 'editing_style'].includes(dbField) && index === 0) {
                console.log(`Mapped ${csvColumn} → ${dbField}:`, value);
              }
            }
          });

          // DEBUG: Log processed video data for first row
          if (index === 0) {
            console.log('Processed video data:', video);
            console.log('New fields detected:', {
              video_theme: video.video_theme,
              cta_type: video.cta_type,
              editing_style: video.editing_style
            });
          }

          // Ensure required fields have defaults
          if (!video.title || video.title.trim() === '') {
            video.title = `Video ${index + 1}`;
          }
          if (!video.published_date) {
            video.published_date = new Date().toISOString().split('T')[0];
          }
          
          // Set default values for numeric fields
          const numericDefaults = {
            views: 0, likes: 0, comments: 0, shares: 0, reach: 0,
            total_time_watched: 0, traffic_for_you: 0, traffic_follow: 0,
            traffic_hashtag: 0, traffic_sound: 0, traffic_profile: 0,
            traffic_search: 0, saves: 0, new_followers: 0
          };
          
          Object.entries(numericDefaults).forEach(([field, defaultValue]) => {
            if (video[field] === undefined || video[field] === null) {
              video[field] = defaultValue;
            }
          });

          processedVideos.push(video);
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
        }
      });

      console.log('Total processed videos:', processedVideos.length);
      console.log('Sample video with new fields:', processedVideos[0]);

      // Import videos in batches
      const batchSize = 5;
      for (let i = 0; i < processedVideos.length; i += batchSize) {
        const batch = processedVideos.slice(i, i + batchSize);
        
        try {
          for (const video of batch) {
            console.log('Sending video to database:', {
              title: video.title,
              video_theme: video.video_theme,
              cta_type: video.cta_type,
              editing_style: video.editing_style
            });
            await onImport([video]);
          }
          setImportProgress(Math.min(100, ((i + batch.length) / processedVideos.length) * 100));
        } catch (error) {
          console.error('Batch import error:', error);
          result.failed += batch.length;
          result.success -= batch.length;
          result.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: Import failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResult(result);
      setStep('complete');

      if (result.success > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${result.success} videos${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        });
      } else {
        toast({
          title: "Import failed",
          description: "No videos were imported successfully",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data",
        variant: "destructive",
      });
      setStep('preview');
    }
  };

  const previewData = csvData.slice(0, 5).map((row, index) => {
    const mapped: any = {};
    
    // Apply automatic column mapping for preview
    Object.entries(COLUMN_MAPPING).forEach(([csvColumn, dbField]) => {
      if (row[csvColumn] !== undefined) {
        const value = parseValue(row[csvColumn], dbField);
        if (value !== null) {
          mapped[dbField] = value;
        }
      }
    });
    
    // Ensure title has a value for preview
    if (!mapped.title || mapped.title.trim() === '') {
      mapped.title = `Video ${index + 1}`;
    }
    
    // DEBUG: Log preview data with new fields
    if (index === 0) {
      console.log('Preview data with new fields:', {
        video_theme: mapped.video_theme,
        cta_type: mapped.cta_type,
        editing_style: mapped.editing_style
      });
    }
    
    return mapped;
  });

  return (
    <Dialog open={open} onOpenChange={() => { resetModal(); onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Import CSV Data</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-purple-bright bg-purple-dark/10' 
                  : 'border-border hover:border-purple-bright/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Drop your CSV file here
              </h3>
              <p className="text-text-secondary mb-4">
                or click to browse your files
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  CSV Format (Automatic Mapping)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-text-secondary">
                <p>Your CSV columns will be automatically mapped to our database fields:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Badge variant="outline">Title → title</Badge>
                  <Badge variant="outline">Views → views</Badge>
                  <Badge variant="outline">Likes → likes</Badge>
                  <Badge variant="outline">Date → published_date</Badge>
                  <Badge variant="outline">Image → image_url</Badge>
                  <Badge variant="outline">URL → video_url</Badge>
                  <Badge variant="outline">Theme → video_theme</Badge>
                  <Badge variant="outline">CTA → cta_type</Badge>
                  <Badge variant="outline">Editing Style → editing_style</Badge>
                </div>
                <p className="mt-3">The system will automatically detect and map your columns based on their names. Supports both English and Spanish column names.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Preview Import</h3>
                <p className="text-text-secondary">
                  Showing first 5 rows of {csvData.length} total rows
                </p>
              </div>
              <Badge variant="outline">{fileName}</Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Editing Style</TableHead>
                    <TableHead>Published Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {row.title || `Video ${index + 1}`}
                      </TableCell>
                      <TableCell>{(row.views || 0).toLocaleString()}</TableCell>
                      <TableCell>{(row.likes || 0).toLocaleString()}</TableCell>
                      <TableCell>{(row.comments || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {row.video_theme || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {row.cta_type || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {row.editing_style || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.published_date || 'Today'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {csvData.length} Videos
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Importing Videos...
              </h3>
              <p className="text-text-secondary">
                Please wait while we process your data
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-text-muted">
                {Math.round(importProgress)}% complete
              </p>
            </div>
          </div>
        )}

        {step === 'complete' && importResult && (
          <div className="space-y-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              importResult.success > 0 ? 'bg-gradient-primary' : 'bg-destructive'
            }`}>
              {importResult.success > 0 ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <AlertCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Import Complete
              </h3>
              <p className="text-text-secondary">
                {importResult.success} videos imported successfully
                {importResult.failed > 0 && `, ${importResult.failed} failed`}
              </p>
            </div>
            
            {importResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Import Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-text-secondary max-h-32 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <p key={index}>• {error}</p>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p>... and {importResult.errors.length - 10} more errors</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={() => { resetModal(); onClose(); }}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};