import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
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

const DATABASE_FIELDS = [
  { value: 'title', label: 'Title' },
  { value: 'image_url', label: 'Image URL' },
  { value: 'video_url', label: 'Video URL' },
  { value: 'external_link', label: 'External Link' },
  { value: 'published_date', label: 'Published Date' },
  { value: 'video_type', label: 'Video Type' },
  { value: 'views', label: 'Views' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Comments' },
  { value: 'shares', label: 'Shares' },
  { value: 'reach', label: 'Reach' },
  { value: 'duration_seconds', label: 'Duration (seconds)' },
  { value: 'engagement_rate', label: 'Engagement Rate' },
  { value: 'full_video_watch_rate', label: 'Full Video Watch Rate' },
  { value: 'total_time_watched', label: 'Total Time Watched' },
  { value: 'avg_time_watched', label: 'Avg Time Watched' },
  { value: 'traffic_for_you', label: 'For You Page Traffic' },
  { value: 'traffic_follow', label: 'Following Traffic' },
  { value: 'traffic_hashtag', label: 'Hashtag Traffic' },
  { value: 'traffic_sound', label: 'Sound Traffic' },
  { value: 'traffic_profile', label: 'Profile Traffic' },
  { value: 'traffic_search', label: 'Search Traffic' },
  { value: 'saves', label: 'Saves' },
  { value: 'new_followers', label: 'New Followers' },
  { value: 'guion', label: 'Script/Guion' },
  { value: 'hook', label: 'Hook' },
];

export const CSVImportModal = ({ open, onClose, onImport }: CSVImportModalProps) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const resetModal = () => {
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setFileName('');
    setImportProgress(0);
    setIsDragOver(false);
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
        const headers = Object.keys(data[0] || {});
        
        setCsvData(data);
        setCsvHeaders(headers);
        setStep('mapping');
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

  const parseValue = (value: string, field: string): any => {
    if (!value || value.trim() === '') return null;
    
    const numericFields = ['views', 'likes', 'comments', 'shares', 'reach', 'duration_seconds', 
                          'total_time_watched', 'traffic_for_you', 'traffic_follow', 
                          'traffic_hashtag', 'traffic_sound', 'traffic_profile', 
                          'traffic_search', 'saves', 'new_followers'];
    
    const percentageFields = ['engagement_rate', 'full_video_watch_rate'];
    const decimalFields = ['avg_time_watched'];
    
    if (numericFields.includes(field)) {
      const parsed = parseInt(value.replace(/[,\s]/g, ''));
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

  const handlePreview = () => {
    const mappedFields = Object.values(columnMapping).filter(Boolean);
    if (mappedFields.length === 0) {
      toast({
        title: "No columns mapped",
        description: "Please map at least one column to continue",
        variant: "destructive",
      });
      return;
    }

    if (!columnMapping.title) {
      toast({
        title: "Title required",
        description: "Please map a column to the Title field",
        variant: "destructive",
      });
      return;
    }

    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);

    try {
      const videos = csvData.map((row, index) => {
        const video: any = {};
        
        Object.entries(columnMapping).forEach(([csvColumn, dbField]) => {
          if (dbField && row[csvColumn] !== undefined) {
            video[dbField] = parseValue(row[csvColumn], dbField);
          }
        });

        // Ensure required fields have defaults
        if (!video.title) video.title = `Video ${index + 1}`;
        if (!video.published_date) video.published_date = new Date().toISOString().split('T')[0];
        if (video.views === undefined) video.views = 0;
        if (video.likes === undefined) video.likes = 0;
        if (video.comments === undefined) video.comments = 0;
        if (video.shares === undefined) video.shares = 0;

        return video;
      });

      // Import in batches to show progress
      const batchSize = 10;
      for (let i = 0; i < videos.length; i += batchSize) {
        const batch = videos.slice(i, i + batchSize);
        await Promise.all(batch.map(video => onImport([video])));
        setImportProgress(Math.min(100, ((i + batchSize) / videos.length) * 100));
      }

      toast({
        title: "Import successful",
        description: `Successfully imported ${videos.length} videos`,
      });

      resetModal();
      onClose();
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data",
        variant: "destructive",
      });
      setStep('preview');
    }
  };

  const previewData = csvData.slice(0, 5).map(row => {
    const mapped: any = {};
    Object.entries(columnMapping).forEach(([csvColumn, dbField]) => {
      if (dbField && row[csvColumn] !== undefined) {
        mapped[dbField] = parseValue(row[csvColumn], dbField);
      }
    });
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
                  CSV Format Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-text-secondary">
                <p>Your CSV should contain columns for video data such as:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Badge variant="outline">Title</Badge>
                  <Badge variant="outline">Views</Badge>
                  <Badge variant="outline">Likes</Badge>
                  <Badge variant="outline">Comments</Badge>
                  <Badge variant="outline">Shares</Badge>
                  <Badge variant="outline">Published Date</Badge>
                </div>
                <p className="mt-3">The next step will let you map your CSV columns to our database fields.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Column Mapping</h3>
                <p className="text-text-secondary">Map your CSV columns to database fields</p>
              </div>
              <Badge variant="outline">{fileName}</Badge>
            </div>

            <Card>
              <CardContent className="space-y-4 p-6">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-text-primary">
                        {header}
                      </label>
                      <p className="text-xs text-text-muted">
                        Sample: {csvData[0]?.[header] || 'N/A'}
                      </p>
                    </div>
                    <div className="w-64">
                      <Select
                        value={columnMapping[header] || ''}
                        onValueChange={(value) => {
                          setColumnMapping(prev => ({ 
                            ...prev, 
                            [header]: value === 'none' ? '' : value 
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Don't import</SelectItem>
                          {DATABASE_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handlePreview}>
                Preview Data
              </Button>
            </div>
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
                      <TableCell>{row.published_date || 'Today'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Back to Mapping
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
      </DialogContent>
    </Dialog>
  );
};