import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    fetchCourseDetails()
  }, [id])

  const fetchCourseDetails = async () => {
    try {
      const courseResponse = await api.get(`/courses/${id}`)
      setCourse(courseResponse.data)
      
      const sectionsResponse = await api.get(`/sections/course/${id}`)
      setSections(sectionsResponse.data)
      
      // Check if user is enrolled
      const token = localStorage.getItem('token')
      if (token) {
        const userData = JSON.parse(localStorage.getItem('userData'))
        const enrollmentResponse = await api.get(`/enrollments/check/${userData.id}/${id}`)
        setEnrolled(enrollmentResponse.data.enrolled)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching course details:', err)
      // Mock data
      setCourse({
        id: parseInt(id),
        title: 'Complete Java Programming',
        description: 'Master Java from basics to advanced concepts. This comprehensive course covers everything you need to know about Java programming.',
        thumbnail: 'https://img.youtube.com/vi/RRubcjpTkks/maxresdefault.jpg',
        instructor_name: 'John Doe',
        category: 'java',
        total_lessons: 45,
        total_duration: '12 hours',
        what_you_will_learn: [
          'Java fundamentals and syntax',
          'Object-oriented programming concepts',
          'Data structures and algorithms',
          'Exception handling',
          'File I/O operations',
          'Multithreading and concurrency'
        ]
      })
      setSections([
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
      ])
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      await api.post('/enrollments', {
        userId: userData.id,
        courseId: id
      })
      setEnrolled(true)
      alert('Successfully enrolled in the course!')
    } catch (err) {
      console.error('Enrollment error:', err)
      setEnrolled(true)
    }
  }

  const handleStartLearning = () => {
    if (sections.length > 0 && sections[0].lessons.length > 0) {
      const firstLesson = sections[0].lessons[0]
      navigate(`/learn/${id}/${firstLesson.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Course not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
              <span>👨‍🏫 {course.instructor_name}</span>
              <span>📚 {course.total_lessons} lessons</span>
              <span>⏱️ {course.total_duration}</span>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">What You Will Learn:</h3>
              <ul className="list-disc list-inside space-y-1">
                {course.what_you_will_learn?.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>

            {!enrolled ? (
              <button
                onClick={handleEnroll}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-semibold"
              >
                Enroll Now
              </button>
            ) : (
              <button
                onClick={handleStartLearning}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-semibold"
              >
                Start Learning
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Sections */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
        
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Section {sectionIndex + 1}: {section.title}
            </h3>
            <div className="space-y-2">
              {section.lessons.map((lesson, lessonIndex) => (
                <div 
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/learn/${id}/${lesson.id}`)}
                >
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-3">{lessonIndex + 1}.</span>
                    <span className="text-gray-900">{lesson.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseDetails
