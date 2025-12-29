// // src/pages/code-challenges/TrackManagement.tsx
// import React, { useState, useEffect } from 'react';
// import { useSearchParams, useParams } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useCodeChallenge } from '../../context/CodeChallengeContext';
// import { Container, Nav, NavItem, NavLink } from 'reactstrap';
// import TracksList from '../../components/code-challenges/TracksList';
// import CreateTrackForm from '../../components/code-challenges/CreateTrackForm';
// import EditTrackForm from '../../components/code-challenges/EditTrackForm';
// import TrackChallengeAssignment from '../../components/code-challenges/TrackChallengeAssignment';

// const TrackManagement: React.FC = () => {
//   const { user } = useAuth();
//   const {
//     adminTracks,
//     trackDetail,
//     loading,
//     loadAllTracksAdmin,
//     loadAllChallengesAdmin,
//     loadTrackById
//   } = useCodeChallenge();

//   const { language, trackSlug } = useParams<{ language: string; trackSlug: string }>();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const tab = searchParams.get('tab') || 'details';

//   const [activeTab, setActiveTab] = useState<'tracks' | 'create' | 'details' | 'edit' | 'challenges'>('tracks');

//   useEffect(() => {
//     loadAllTracksAdmin();
//     loadAllChallengesAdmin();
//   }, []);

//   // Handle URL-based track loading
//   useEffect(() => {
//     if (language && trackSlug) {
//       loadTrackById(language, trackSlug);
      
//       // Set active tab based on URL parameter
//       switch (tab) {
//         case 'edit':
//           setActiveTab('edit');
//           break;
//         case 'challenges':
//           setActiveTab('challenges');
//           break;
//         default:
//           setActiveTab('details');
//       }
//     } else {
//       setActiveTab('tracks');
//     }
//   }, [language, trackSlug, tab, loadTrackById]);

//   const handleTrackCreated = () => {
//     loadAllTracksAdmin();
//     setActiveTab('tracks');
//     setSearchParams({});
//   };

//   const handleTrackUpdated = () => {
//     if (language && trackSlug) {
//       loadTrackById(language, trackSlug);
//     }
//     loadAllTracksAdmin();
//   };

//   const handleAssignmentComplete = () => {
//     if (language && trackSlug) {
//       loadTrackById(language, trackSlug);
//     }
//     loadAllTracksAdmin();
//   };

//   const handleBackToTracks = () => {
//     window.history.pushState({}, '', '/admin/code-challenges/tracks');
//     setActiveTab('tracks');
//     setSearchParams({});
//   };

//   const handleTabChange = (newTab: string) => {
//     if (language && trackSlug) {
//       setSearchParams({ tab: newTab });
//     }
//   };

//   // If we have a specific track in the URL, show track-specific view
//   if (language && trackSlug) {
//     if (loading.track && !trackDetail) {
//       return (
//         <Container fluid className="py-4">
//           <div className="text-center py-5">
//             <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
//             <div className="mt-3">Loading track...</div>
//           </div>
//         </Container>
//       );
//     }

//     if (!trackDetail) {
//       return (
//         <Container fluid className="py-4">
//           <div className="alert alert-warning">
//             Track not found: {language}/{trackSlug}
//           </div>
//         </Container>
//       );
//     }

//     return (
//       <Container fluid className="py-4">
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <div>
//             <h2>{trackDetail.title}</h2>
//             <p className="text-muted mb-0">{trackDetail.description}</p>
//           </div>
//           <button 
//             className="btn btn-outline-secondary"
//             onClick={handleBackToTracks}
//           >
//             ← Back to All Tracks
//           </button>
//         </div>

//         <Nav tabs className="mb-4">
//           <NavItem>
//             <NavLink
//               className={activeTab === 'details' ? 'active' : ''}
//               onClick={() => {
//                 setActiveTab('details');
//                 handleTabChange('details');
//               }}
//               href="#"
//             >
//               Track Details
//             </NavLink>
//           </NavItem>
//           <NavItem>
//             <NavLink
//               className={activeTab === 'edit' ? 'active' : ''}
//               onClick={() => {
//                 setActiveTab('edit');
//                 handleTabChange('edit');
//               }}
//               href="#"
//             >
//               Edit Track
//             </NavLink>
//           </NavItem>
//           <NavItem>
//             <NavLink
//               className={activeTab === 'challenges' ? 'active' : ''}
//               onClick={() => {
//                 setActiveTab('challenges');
//                 handleTabChange('challenges');
//               }}
//               href="#"
//             >
//               Manage Challenges ({trackDetail.challenges?.length || 0})
//             </NavLink>
//           </NavItem>
//         </Nav>

//         {/* Tab Content */}
//         {activeTab === 'details' && (
//           <div>
//             <div className="row">
//               <div className="col-lg-8">
//                 <div className="card">
//                   <div className="card-body">
//                     <h5>Track Information</h5>
//                     <dl className="row">
//                       <dt className="col-sm-3">Language:</dt>
//                       <dd className="col-sm-9">
//                         <span className="badge bg-primary">{trackDetail.language}</span>
//                       </dd>
//                       <dt className="col-sm-3">Difficulty:</dt>
//                       <dd className="col-sm-9">
//                         <span className="badge bg-warning">{trackDetail.difficulty}</span>
//                       </dd>
//                       <dt className="col-sm-3">Category:</dt>
//                       <dd className="col-sm-9">
//                         <span className="badge bg-info">{trackDetail.category}</span>
//                       </dd>
//                       <dt className="col-sm-3">Estimated Hours:</dt>
//                       <dd className="col-sm-9">{trackDetail.estimatedHours} hours</dd>
//                       <dt className="col-sm-3">Status:</dt>
//                       <dd className="col-sm-9">
//                         <span className={`badge ${trackDetail.isActive ? 'bg-success' : 'bg-secondary'}`}>
//                           {trackDetail.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </dd>
//                     </dl>

//                     {trackDetail.learningObjectives && trackDetail.learningObjectives.length > 0 && (
//                       <>
//                         <h6>Learning Objectives</h6>
//                         <ul>
//                           {trackDetail.learningObjectives.map((objective, index) => (
//                             <li key={index}>{objective}</li>
//                           ))}
//                         </ul>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-4">
//                 <div className="card">
//                   <div className="card-body">
//                     <h5>Statistics</h5>
//                     <dl className="row">
//                       <dt className="col-6">Enrolled:</dt>
//                       <dd className="col-6">{trackDetail.stats?.totalEnrolled || 0}</dd>
//                       <dt className="col-6">Completed:</dt>
//                       <dd className="col-6">{trackDetail.stats?.totalCompleted || 0}</dd>
//                       <dt className="col-6">Completion Rate:</dt>
//                       <dd className="col-6">{trackDetail.stats?.completionRate || 0}%</dd>
//                       <dt className="col-6">Rating:</dt>
//                       <dd className="col-6">
//                         {trackDetail.stats?.rating ? 
//                           `${trackDetail.stats.rating.toFixed(1)}/5.0` : 'No ratings'
//                         }
//                       </dd>
//                     </dl>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {activeTab === 'edit' && trackDetail && (
//           <div>
//             <EditTrackForm
//               track={trackDetail}
//               onTrackUpdated={handleTrackUpdated}
//               onCancel={() => {
//                 setActiveTab('details');
//                 handleTabChange('details');
//               }}
//             />
//           </div>
//         )}
        
//         {activeTab === 'challenges' && trackDetail && (
//           <div>
//             <TrackChallengeAssignment
//               track={trackDetail}
//               onComplete={handleAssignmentComplete}
//               onCancel={() => {
//                 setActiveTab('details');
//                 handleTabChange('details');
//               }}
//             />
//           </div>
//         )}
//       </Container>
//     );
//   }

//   // Default view - show all tracks or create form
//   return (
//     <Container fluid className="py-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Track Management</h2>
//       </div>

//       <Nav tabs className="mb-4">
//         <NavItem>
//           <NavLink
//             className={activeTab === 'tracks' ? 'active' : ''}
//             onClick={() => setActiveTab('tracks')}
//             href="#"
//           >
//             All Tracks
//           </NavLink>
//         </NavItem>
//         <NavItem>
//           <NavLink
//             className={activeTab === 'create' ? 'active' : ''}
//             onClick={() => setActiveTab('create')}
//             href="#"
//           >
//             Create Track
//           </NavLink>
//         </NavItem>
//       </Nav>

//       {/* Tab Content */}
//       {activeTab === 'tracks' && (
//         <div>
//           <TracksList
//             tracks={adminTracks}
//             loading={loading.adminTracks}
//             onAssignChallenges={(track) => {
//               window.history.pushState({}, '', `/admin/code-challenges/tracks/${track.language}/${track.slug}?tab=challenges`);
//               window.location.reload();
//             }}
//             onEditTrack={(track) => {
//               window.history.pushState({}, '', `/admin/code-challenges/tracks/${track.language}/${track.slug}?tab=edit`);
//               window.location.reload();
//             }}
//             onRefresh={loadAllTracksAdmin}
//           />
//         </div>
//       )}
      
//       {activeTab === 'create' && (
//         <div>
//           <CreateTrackForm
//             onTrackCreated={handleTrackCreated}
//             onCancel={() => setActiveTab('tracks')}
//           />
//         </div>
//       )}
//     </Container>
//   );
// };

// export default TrackManagement;