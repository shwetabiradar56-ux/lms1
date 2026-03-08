import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const LearningPage = ({ user }) => {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLearningData()
  }, [courseId, lessonId])

  const fetchLearningData = async () => {
    try {
      // Fetch course data
      const courseResponse = await api.get(`/courses/${courseId}`)
      setCourse(courseResponse.data)

      // Fetch sections and lessons
      const sectionsResponse = await api.get(`/sections/course/${courseId}`)
      setSections(sectionsResponse.data)

      // Find current lesson
      let foundLesson = null
      sectionsResponse.data.forEach(section => {
        const lesson = section.lessons.find(l => l.id === parseInt(lessonId))
        if (lesson) foundLesson = lesson
      })
      setCurrentLesson(foundLesson)

      // Fetch user progress
      const progressResponse = await api.get(`/progress/${user.id}`)
      setProgress(progressResponse.data)

      setLoading(false)
    } catch (err) {
      console.error('Error fetching learning data:', err)
      
      // Mock data for demonstration
      setCourse({
        id: parseInt(courseId),
        title: 'Complete Java Programming'
      })

      const mockSections = [
        {
          id: 1,
          title: 'Introduction to Java',
          lessons: [
            { id: 1, title: 'What is Java?', duration: '10:00', youtube_url: 'RRubcjpTkks' },
            { id: 2, title: 'Setting up Environment', duration: '15:00', youtube_url: '_uQrJ0TkZlc' },
            { id: 3, title: 'Your First Java Program', duration: '12:00', youtube_url: 'GwIo9gDZCVQ' }
          ]
        },
        {
          id: 2,
          title: 'Java Basics',
          lessons: [
            { id: 4, title: 'Variables and Data Types', duration: '18:00', youtube_url: 'H1e7fIRutxk' },
            { id: 5, title: 'Operators', duration: '20:00', youtube_url: 'RRubcjpTkks' }
          ]
        }
      ]
      setSections(mockSections)

      let foundLesson = null
      mockSections.forEach(section => {
        const lesson = section.lessons.find(l => l.id === parseInt(lessonId))
        if (lesson) foundLesson = lesson
      })
      setCurrentLesson(foundLesson)
      setLoading(false)
    }
  }

  const handleVideoEnd = async () => {
    if (isLessonCompleted(currentLesson.id)) return

    try {
      // Mark lesson as completed
      await api.post('/progress', {
        userId: user.id,
        lessonId: currentLesson.id,
        completed: true
      })
      
      // Update local progress without duplicates
      setProgress(prev => {
        const exists = prev.some(p => (p.lessonId || p.lesson_id) === currentLesson.id)
        if (exists) {
          return prev.map(p => 
            (p.lessonId || p.lesson_id) === currentLesson.id ? { ...p, completed: true } : p
          )
        }
        return [...prev, { lessonId: currentLesson.id, completed: true }]
      })
      
      // Auto-advance to next lesson
      const nextLesson = getNextLesson()
      if (nextLesson) {
        setTimeout(() => {
          navigate(`/learn/${courseId}/${nextLesson.id}`)
        }, 2000)
      }
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  const isLessonCompleted = (lessonId) => {
    return progress.some(p => (p.lessonId === lessonId || p.lesson_id === lessonId) && p.completed)
  }

  const getPreviousLesson = () => {
    let allLessons = []
    sections.forEach(section => {
      allLessons = [...allLessons, ...section.lessons]
    })
    
    const currentIndex = allLessons.findIndex(l => l.id === parseInt(lessonId))
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null
  }

  const getNextLesson = () => {
    let allLessons = []
    sections.forEach(section => {
      allLessons = [...allLessons, ...section.lessons]
    })
    
    const currentIndex = allLessons.findIndex(l => l.id === parseInt(lessonId))
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  }

  const calculateProgress = () => {
    // Get all lesson IDs for the current course
    const courseLessonIds = []
    sections.forEach(section => {
      section.lessons.forEach(lesson => {
        courseLessonIds.push(lesson.id)
      })
    })
    
    const totalLessons = courseLessonIds.length
    if (totalLessons === 0) return 0
    
    // Only count completed lessons that belong to this course
    const completedInCourse = progress.filter(p => {
      const lid = p.lessonId || p.lesson_id
      return p.completed && courseLessonIds.includes(lid)
    })
    
    const uniqueCompletedIds = new Set(completedInCourse.map(p => p.lessonId || p.lesson_id))
    const completedCount = uniqueCompletedIds.size
    
    return Math.round((completedCount / totalLessons) * 100)
  }

  if (loading || !currentLesson) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Video Player */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* YouTube Video Player */}
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${currentLesson.youtubeUrl || currentLesson.youtube_url}?autoplay=1&rel=0`}
                title={currentLesson.title}
                className="w-full h-[500px]"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onEnded={handleVideoEnd}
              ></iframe>
            </div>

            {/* Lesson Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentLesson.title}
              </h1>
              <p className="text-gray-600 mb-4">Lesson {currentLesson.id} • {currentLesson.duration}</p>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const prev = getPreviousLesson()
                    if (prev) navigate(`/learn/${courseId}/${prev.id}`)
                  }}
                  disabled={!getPreviousLesson()}
                  className={`px-4 py-2 rounded-md ${
                    getPreviousLesson()
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ← Previous
                </button>
                
                <button
                  onClick={handleVideoEnd}
                  disabled={isLessonCompleted(currentLesson.id)}
                  className={`px-6 py-2 rounded-md transition-colors ${
                    isLessonCompleted(currentLesson.id)
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isLessonCompleted(currentLesson.id) ? '✓ Completed' : '✓ Mark as Complete'}
                </button>
                
                <button
                  onClick={() => {
                    const next = getNextLesson()
                    if (next) navigate(`/learn/${courseId}/${next.id}`)
                  }}
                  disabled={!getNextLesson()}
                  className={`px-4 py-2 rounded-md ${
                    getNextLesson()
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Lesson List & Progress */}
        <div className="lg:col-span-1">
          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Course Progress</span>
                <span className="text-sm font-semibold">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {(() => {
                const courseLessonIds = []
                sections.forEach(s => s.lessons.forEach(l => courseLessonIds.push(l.id)))
                const uniqueCompletedInCourse = new Set(
                  progress.filter(p => p.completed && courseLessonIds.includes(p.lessonId || p.lesson_id))
                  .map(p => p.lessonId || p.lesson_id)
                )
                return uniqueCompletedInCourse.size
              })()} of {
                sections.reduce((acc, section) => acc + section.lessons.length, 0)
              } lessons completed
            </div>
          </div>

          {/* Lesson List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>
            
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Section {sectionIndex + 1}: {section.title}
                </h3>
                <div className="space-y-2">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      onClick={() => navigate(`/learn/${courseId}/${lesson.id}`)}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                        parseInt(lessonId) === lesson.id
                          ? 'bg-indigo-50 border-l-4 border-indigo-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          {isLessonCompleted(lesson.id) ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-gray-400">{lessonIndex + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm ${
                            parseInt(lessonId) === lesson.id 
                              ? 'text-indigo-900 font-semibold' 
                              : 'text-gray-900'
                          }`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500">{lesson.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningPage
