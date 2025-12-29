// // src/pages/code-challenges/ChallengeManagement.tsx
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Container, 
//   Row, 
//   Col, 
//   Card, 
//   CardBody, 
//   Button,
//   Badge,
//   Spinner,
//   Alert
// } from 'reactstrap';
// import {
//   Book,
//   Plus,
//   Code,
//   Users,
//   Clock,
//   Star,
//   TrendingUp,
//   Activity
// } from 'lucide-react';
// import { useCodeChallenge } from '../../context/CodeChallengeContext';

// const ChallengeManagement: React.FC = () => {
//   const navigate = useNavigate();
//   const { 
//     tracksOverview, 
//     challengesOverview, 
//     loading, 
//     loadTracksOverview, 
//     loadChallengesOverview 
//   } = useCodeChallenge();

//   useEffect(() => {
//     loadTracksOverview();
//     loadChallengesOverview();
//   }, []);

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case 'easy': return 'success';
//       case 'medium': return 'warning';
//       case 'hard': return 'danger';
//       default: return 'secondary';
//     }
//   };

//   const getLanguageColor = (language: string) => {
//     switch (language) {
//       case 'javascript': return 'warning';
//       case 'python': return 'info';
//       case 'dart': return 'primary';
//       default: return 'secondary';
//     }
//   };

//   if (loading.adminTracks || loading.adminChallenges) {
//     return (
//       <Container fluid className="py-4">
//         <div className="text-center py-5">
//           <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
//           <div className="mt-3">Loading dashboard...</div>
//         </div>
//       </Container>
//     );
//   }

//   return (
//     <Container fluid className="py-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <div>
//           <h1 className="mb-2">Code Challenge Dashboard</h1>
//           <p className="text-muted mb-0">
//             Overview of learning tracks and challenges
//           </p>
//         </div>
//         <div className="d-flex gap-2">
//           <Button 
//             color="outline-primary"
//             onClick={() => navigate('/admin/code-challenges/challenges')}
//           >
//             <Code className="me-2" size={16} />
//             Manage Challenges
//           </Button>
//           <Button 
//             color="primary"
//             onClick={() => navigate('/admin/code-challenges/tracks')}
//           >
//             <Book className="me-2" size={16} />
//             Manage Tracks
//           </Button>
//         </div>
//       </div>

//       {/* Overview Stats */}
//       <Row className="mb-4">
//         <Col lg={3} md={6} className="mb-3">
//           <Card className="border-0 shadow-sm">
//             <CardBody>
//               <div className="d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <div className="text-muted small">Total Tracks</div>
//                   <div className="h4 mb-0">{tracksOverview.length}</div>
//                 </div>
//                 <div className="text-primary">
//                   <Book size={24} />
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>
//         <Col lg={3} md={6} className="mb-3">
//           <Card className="border-0 shadow-sm">
//             <CardBody>
//               <div className="d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <div className="text-muted small">Total Challenges</div>
//                   <div className="h4 mb-0">{challengesOverview.length}</div>
//                 </div>
//                 <div className="text-success">
//                   <Code size={24} />
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>
//         <Col lg={3} md={6} className="mb-3">
//           <Card className="border-0 shadow-sm">
//             <CardBody>
//               <div className="d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <div className="text-muted small">Total Enrollments</div>
//                   <div className="h4 mb-0">
//                     {tracksOverview.reduce((sum, track) => sum + (track.stats?.totalEnrolled || 0), 0)}
//                   </div>
//                 </div>
//                 <div className="text-info">
//                   <Users size={24} />
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>
//         <Col lg={3} md={6} className="mb-3">
//           <Card className="border-0 shadow-sm">
//             <CardBody>
//               <div className="d-flex align-items-center">
//                 <div className="flex-grow-1">
//                   <div className="text-muted small">Avg. Completion Rate</div>
//                   <div className="h4 mb-0">
//                     {tracksOverview.length > 0 
//                       ? Math.round(tracksOverview.reduce((sum, track) => sum + (track.stats?.completionRate || 0), 0) / tracksOverview.length)
//                       : 0
//                     }%
//                   </div>
//                 </div>
//                 <div className="text-warning">
//                   <TrendingUp size={24} />
//                 </div>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>
//       </Row>

//       {/* Recent Tracks */}
//       <Row>
//         <Col lg={8}>
//           <Card className="mb-4">
//             <CardBody>
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="mb-0">Recent Tracks</h5>
//                 <Button 
//                   color="link" 
//                   className="text-decoration-none"
//                   onClick={() => navigate('/admin/code-challenges/tracks')}
//                 >
//                   View All →
//                 </Button>
//               </div>
              
//               {tracksOverview.length === 0 ? (
//                 <div className="text-center py-4">
//                   <Book size={48} className="text-muted mb-3" />
//                   <h6 className="text-muted">No tracks created yet</h6>
//                   <p className="text-muted mb-4">
//                     Create your first learning track to organize challenges.
//                   </p>
//                   <Button 
//                     color="primary"
//                     onClick={() => navigate('/admin/code-challenges/tracks')}
//                   >
//                     <Plus className="me-2" size={16} />
//                     Create Track
//                   </Button>
//                 </div>
//               ) : (
//                 <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                   {tracksOverview.slice(0, 5).map((track) => (
//                     <div key={track._id} className="d-flex align-items-center p-3 border rounded mb-2">
//                       <div className="flex-grow-1">
//                         <h6 className="mb-1">{track.title}</h6>
//                         <div className="d-flex gap-2 mb-1">
//                           <Badge color={getLanguageColor(track.language)} size="sm">
//                             {track.language}
//                           </Badge>
//                           <Badge color={getDifficultyColor(track.difficulty)} size="sm">
//                             {track.difficulty}
//                           </Badge>
//                           {track.isFeatured && (
//                             <Badge color="primary" size="sm">
//                               <Star className="me-1" style={{ width: '10px', height: '10px' }} />
//                               Featured
//                             </Badge>
//                           )}
//                         </div>
//                         <div className="d-flex gap-3 text-muted small">
//                           <span>{track.challenges?.length || 0} challenges</span>
//                           <span>{track.stats?.totalEnrolled || 0} enrolled</span>
//                           <span>{track.stats?.completionRate || 0}% completion</span>
//                         </div>
//                       </div>
//                       <Button
//                         color="outline-primary"
//                         size="sm"
//                         onClick={() => navigate(`/admin/code-challenges/tracks/${track.language}/${track.slug}`)}
//                       >
//                         Manage
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardBody>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card>
//             <CardBody>
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="mb-0">Challenge Stats</h5>
//                 <Activity size={20} className="text-muted" />
//               </div>
              
//               {challengesOverview.length === 0 ? (
//                 <div className="text-center py-4">
//                   <Code size={48} className="text-muted mb-3" />
//                   <h6 className="text-muted">No challenges yet</h6>
//                   <p className="text-muted small">
//                     Upload challenges via JSON or scripts.
//                   </p>
//                 </div>
//               ) : (
//                 <div>
//                   <div className="d-flex justify-content-between mb-2">
//                     <span className="text-muted">Easy</span>
//                     <span className="fw-bold text-success">
//                       {challengesOverview.filter(c => c.difficulty === 'easy').length}
//                     </span>
//                   </div>
//                   <div className="d-flex justify-content-between mb-2">
//                     <span className="text-muted">Medium</span>
//                     <span className="fw-bold text-warning">
//                       {challengesOverview.filter(c => c.difficulty === 'medium').length}
//                     </span>
//                   </div>
//                   <div className="d-flex justify-content-between mb-3">
//                     <span className="text-muted">Hard</span>
//                     <span className="fw-bold text-danger">
//                       {challengesOverview.filter(c => c.difficulty === 'hard').length}
//                     </span>
//                   </div>
//                   <hr />
//                   <div className="d-flex justify-content-between mb-2">
//                     <span className="text-muted">JavaScript</span>
//                     <span className="fw-bold">
//                       {challengesOverview.filter(c => c.supportedLanguages?.includes('javascript')).length}
//                     </span>
//                   </div>
//                   <div className="d-flex justify-content-between mb-2">
//                     <span className="text-muted">Python</span>
//                     <span className="fw-bold">
//                       {challengesOverview.filter(c => c.supportedLanguages?.includes('python')).length}
//                     </span>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <span className="text-muted">Dart</span>
//                     <span className="fw-bold">
//                       {challengesOverview.filter(c => c.supportedLanguages?.includes('dart')).length}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </CardBody>
//           </Card>
//         </Col>
//       </Row>

//       <style>{`
//         .card:hover {
//           box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1) !important;
//           transition: box-shadow 0.2s ease;
//         }
//       `}</style>
//     </Container>
//   );
// };

// export default ChallengeManagement;