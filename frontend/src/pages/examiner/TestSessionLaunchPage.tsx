import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { testTemplatesApi, testSessionsApi, type TestTemplate, type Participant } from '@/services/api';
import { toast } from 'sonner';

const TestSessionLaunchPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(60);
  const [participantIdentifiersText, setParticipantIdentifiersText] = useState('');
  const [startTimeDate, setStartTimeDate] = useState<string>('');
  const [startTimeTime, setStartTimeTime] = useState<string>('');
  const [endTimeDate, setEndTimeDate] = useState<string>('');
  const [endTimeTime, setEndTimeTime] = useState<string>('');
  
  // Results state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Check if session duration is valid (must be at least timeLimitMinutes)
  const sessionDurationError = useMemo(() => {
    if (!startTimeDate || !startTimeTime || !endTimeDate || !endTimeTime) {
      return false; // Don't show error if fields are empty (handled by required validation)
    }

    const startDateTime = new Date(`${startTimeDate}T${startTimeTime}`);
    const endDateTime = new Date(`${endTimeDate}T${endTimeTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return false; // Don't show error if dates are invalid (handled by validation)
    }

    const sessionDurationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    return sessionDurationMinutes < timeLimitMinutes;
  }, [startTimeDate, startTimeTime, endTimeDate, endTimeTime, timeLimitMinutes]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const templates = await testTemplatesApi.getAll();
      setTemplates(templates);
    } catch (error) {
      toast.error('Failed to load templates', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedTemplateId) {
      toast.error('Please select a test template');
      return false;
    }

    if (!timeLimitMinutes || timeLimitMinutes < 1 || timeLimitMinutes > 480) {
      toast.error('Time limit must be between 1 and 480 minutes');
      return false;
    }

    const parsedParticipants = participantIdentifiersText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (parsedParticipants.length === 0) {
      toast.error('Please provide at least one participant identifier');
      return false;
    }

    if (!startTimeDate || !startTimeTime) {
      toast.error('Please select a start date and time');
      return false;
    }

    if (!endTimeDate || !endTimeTime) {
      toast.error('Please select an end date and time');
      return false;
    }

    const startDateTime = new Date(`${startTimeDate}T${startTimeTime}`);
    const endDateTime = new Date(`${endTimeDate}T${endTimeTime}`);
    const now = new Date();

    if (isNaN(startDateTime.getTime())) {
      toast.error('Invalid start date/time');
      return false;
    }

    if (isNaN(endDateTime.getTime())) {
      toast.error('Invalid end date/time');
      return false;
    }

    if (startDateTime >= endDateTime) {
      toast.error('End time must be after start time');
      return false;
    }

    if (startDateTime < now) {
      toast.error('Start time cannot be in the past');
      return false;
    }

    // Check if session duration is at least equal to time limit
    const sessionDurationMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    if (sessionDurationMinutes < timeLimitMinutes) {
      toast.error(`Session duration must be at least ${timeLimitMinutes} minutes (time limit)`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Parse participants
      const parsedParticipants = participantIdentifiersText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // Combine date and time into ISO strings
      const startDateTime = new Date(`${startTimeDate}T${startTimeTime}`);
      const endDateTime = new Date(`${endTimeDate}T${endTimeTime}`);

      const response = await testSessionsApi.create({
        templateId: selectedTemplateId,
        timeLimitMinutes,
        participants: parsedParticipants,
        startTime: startDateTime,
        endTime: endDateTime,
      });

      setSessionId(response.session.id);
      setParticipants(response.participants);

      toast.success('Test session launched successfully!', {
        description: `${response.participants.length} participants added, ${response.participants.length} access codes generated.`,
      });
    } catch (error) {
      toast.error('Failed to launch test session', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Access code copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error('Failed to copy access code');
    }
  };

  const handleCopyAll = async () => {
    try {
      const text = participants
        .map((p) => `${p.identifier}: ${p.access_code}`)
        .join('\n');
      await navigator.clipboard.writeText(text);
      toast.success('All access codes copied to clipboard');
    } catch {
      toast.error('Failed to copy access codes');
    }
  };

  const handleLaunchAnother = () => {
    setSelectedTemplateId('');
    setTimeLimitMinutes(60);
    setParticipantIdentifiersText('');
    setStartTimeDate('');
    setStartTimeTime('');
    setEndTimeDate('');
    setEndTimeTime('');
    setSessionId(null);
    setParticipants([]);
    setCopiedCode(null);
  };

  const handleViewReport = () => {
    if (sessionId) {
      // TODO: Navigate to test session report page when implemented
      toast.info('Test Session Report page coming soon');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (templates.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>No Test Templates Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You need to create at least one test template before launching a test session.
              </p>
              <Button onClick={() => navigate('/test-templates')}>
                Create Test Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">Launch Test Session</h1>
          <p className="text-muted-foreground mt-2">
            Select a template, set a time limit, and add participants to generate access codes
          </p>
        </div>

        {/* Form Section */}
        {!sessionId && (
          <Card>
            <CardHeader>
              <CardTitle>Test Session Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Test Template *</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger id="template" className="w-full">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes) *</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  max="480"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 1)}
                  placeholder="60"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: 1 minute, Maximum: 480 minutes (8 hours)
                </p>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Date & Time *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                      Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startTimeDate}
                      onChange={(e) => setStartTimeDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="startTimeInput" className="text-xs text-muted-foreground">
                      Time
                    </Label>
                    <Input
                      id="startTimeInput"
                      type="time"
                      value={startTimeTime}
                      onChange={(e) => setStartTimeTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  When the test session becomes available to participants
                </p>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="endTime">End Date & Time *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                      Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endTimeDate}
                      onChange={(e) => setEndTimeDate(e.target.value)}
                      min={startTimeDate || new Date().toISOString().split('T')[0]}
                      className={`w-full ${sessionDurationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endTimeInput" className="text-xs text-muted-foreground">
                      Time
                    </Label>
                    <Input
                      id="endTimeInput"
                      type="time"
                      value={endTimeTime}
                      onChange={(e) => setEndTimeTime(e.target.value)}
                      className={`w-full ${sessionDurationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  </div>
                </div>
                {sessionDurationError ? (
                  <p className="text-xs text-red-500 font-medium">
                    Session duration must be at least {timeLimitMinutes} minutes (time limit)
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    When the test session closes and participants can no longer start
                  </p>
                )}
              </div>

              {/* Participant Identifiers */}
              <div className="space-y-2">
                <Label htmlFor="participants">Participant Identifiers *</Label>
                <Textarea
                  id="participants"
                  value={participantIdentifiersText}
                  onChange={(e) => setParticipantIdentifiersText(e.target.value)}
                  placeholder="John Doe&#10;Jane Smith&#10;STU-2024-001&#10;student@example.com"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one identifier per line (names, student IDs, email addresses, etc.)
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Launching...' : 'Launch Test Session'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success Results Section */}
        {sessionId && participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                Test Session Launched Successfully!
              </CardTitle>
              <p className="text-muted-foreground">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} added,{' '}
                {participants.length} access code{participants.length !== 1 ? 's' : ''} generated.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Access Codes Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Access Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">
                          {participant.identifier}
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {participant.access_code}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(participant.access_code)}
                            className="gap-2"
                          >
                            {copiedCode === participant.access_code ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCopyAll} variant="outline" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy All Codes
                </Button>
                <Button onClick={handleViewReport} variant="outline" className="gap-2">
                  View Report
                </Button>
                <Button onClick={handleLaunchAnother} className="gap-2">
                  Launch Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestSessionLaunchPage;

