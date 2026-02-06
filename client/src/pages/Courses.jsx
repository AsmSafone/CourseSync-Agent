import React, { useState, useEffect } from 'react';
import { getState, addSyllabusText, addSyllabusUrl, addSyllabusPdf, deleteCourse } from '../services/api';
import { Trash2, Plus, FileText, Link as LinkIcon, Upload, Loader, BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('text'); // text, url, pdf
    const [semesterStart, setSemesterStart] = useState('2025-09-01');
    const [loading, setLoading] = useState(false);

    // Form Inputs
    const [textInput, setTextInput] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [fileInput, setFileInput] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        const data = await getState();
        if (data) setCourses(data.courses);
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (activeTab === 'text') {
                res = await addSyllabusText(textInput, semesterStart);
            } else if (activeTab === 'url') {
                res = await addSyllabusUrl(urlInput, semesterStart);
            } else if (activeTab === 'pdf') {
                if (!fileInput) { alert("Please select a file"); setLoading(false); return; }
                res = await addSyllabusPdf(fileInput, semesterStart);
            }

            if (res && res.data && res.data.success) {
                // Clear inputs
                setTextInput('');
                setUrlInput('');
                setFileInput(null);
                // Reload
                await loadCourses();
            } else {
                alert('Failed to add course: ' + (res?.data?.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error adding course. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this course and all its assignments?")) return;
        try {
            await deleteCourse(index);
            loadCourses();
        } catch (e) {
            console.error(e);
            alert("Failed to delete course");
        }
    }

    const tabs = [
        { id: 'text', label: 'Paste Text', icon: FileText },
        { id: 'url', label: 'URL', icon: LinkIcon },
        { id: 'pdf', label: 'Upload PDF', icon: Upload },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Manage Your Courses</h1>
                <p className="text-muted-foreground mt-2">Import syllabi to automatically generate and track assignments</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Enrolled</p>
                            <p className="text-2xl font-bold">{courses.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Assignments</p>
                            <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + (c.assignments?.length || 0), 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Semester</p>
                            <p className="text-2xl font-bold">16w</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Add Course Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1"
                >
                    <Card className="border-0 shadow-lg sticky top-24 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus size={20} className="text-blue-600" /> Add New Course
                            </CardTitle>
                            <CardDescription>
                                Import your syllabus to automatically generate assignments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Custom Tabs */}
                            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-md text-xs font-semibold transition-all",
                                            activeTab === tab.id
                                                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                                : "text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200"
                                        )}
                                    >
                                        <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleAddCourse} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Semester Start Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={semesterStart}
                                        onChange={(e) => setSemesterStart(e.target.value)}
                                        required
                                        className="rounded-lg"
                                    />
                                </div>

                                {activeTab === 'text' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Syllabus Text</label>
                                        <Textarea
                                            rows="6"
                                            placeholder="Paste course syllabus content here..."
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            required
                                            className="font-mono text-sm leading-relaxed rounded-lg resize-none"
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'url' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Course Page URL</label>
                                        <Input
                                            type="url"
                                            placeholder="https://example.university.edu/course"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            required
                                            className="rounded-lg"
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'pdf' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Syllabus PDF</label>
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all cursor-pointer relative group">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setFileInput(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required={!fileInput}
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload size={24} />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {fileInput ? fileInput.name : "Click to upload"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">PDF, up to 10MB</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <Button type="submit" className="w-full mt-6 rounded-lg h-11 font-semibold" disabled={loading} size="lg">
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin mr-2" size={18} />
                                            Processing...
                                        </>
                                    ) : 'Process Syllabus'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Course List */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Your Courses</h2>
                        <p className="text-muted-foreground">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</p>
                    </div>

                    {courses.length === 0 ? (
                        <Card className="py-16 border-dashed border-2 border-slate-300 dark:border-slate-700">
                            <div className="flex flex-col items-center justify-center text-center px-6">
                                <div className="h-20 w-20 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mb-6">
                                    <BookOpen size={40} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-bold text-lg">No courses yet</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mt-3 leading-relaxed">
                                    Start by importing your first course syllabus using the form on the left.
                                </p>
                                <Button className="mt-6 rounded-lg" variant="default">
                                    <Plus className="mr-2 h-4 w-4" /> Add First Course
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {courses.map((course, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group"
                                >
                                    <Card className="border-0 shadow-sm hover:shadow-lg transition-all bg-white dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{course.course_name}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">{course.course_code}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(idx)}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950/20 transition-colors flex-shrink-0"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={18} />
                                                </motion.button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    <div className="text-xs text-muted-foreground font-medium mb-1">Assignments</div>
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.assignments ? course.assignments.length : 0}</div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    <div className="text-xs text-muted-foreground font-medium mb-1">Progress</div>
                                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round((course.assignments?.filter(a => a.progress === 100).length || 0) / Math.max(1, course.assignments?.length || 1) * 100)}%</div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    <div className="text-xs text-muted-foreground font-medium mb-1">Status</div>
                                                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">Active</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Courses;
