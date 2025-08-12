// src/pages/CreateTestPage.tsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Alert, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { testAPI, questionAPI } from "../services/testAPI";

import type { Question } from "../types/questions";

// ✅ All test-related types now come from the centralized types file
import type {
    TestTemplate,
    CreateTestData,
    SectionType,
    SectionWithQuestions,
} from "../types/tests";

// Components
import TestConfigPanel from "../components/tests/TestConfigPanel";
import QuestionBrowser from "../components/tests/QuestionBrowser";
import QuestionCreator from "../components/tests/QuestionCreator";
import SectionManager from "../components/tests/SectionsManager";
import SectionModal from "../components/tests/SectionModal";


const CreateTestPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [templates, setTemplates] = useState<TestTemplate[]>([]);
    const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

    const [activeTab, setActiveTab] = useState<"browse" | "create" | "sections">(
        "browse"
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
        null
    );

    const [newQuestions, setNewQuestions] = useState<Question[]>([]);
    const [validationResult, setValidationResult] = useState<
        { valid: boolean; errors?: string[]; warnings?: string[] } | null
    >(null);

    const [testData, setTestData] = useState<CreateTestData>({
        title: "",
        description: "",
        instructions: "",
        skills: [],
        testType: "single_skill",
        settings: {
            timeLimit: 60,
            attemptsAllowed: 1,
            shuffleQuestions: true,
            shuffleOptions: true,
            showResults: true,
            showCorrectAnswers: false,
            passingScore: 70,
            useSections: false,
            useQuestionPool: false
        },
        questions: [],
        sections: [],
        questionPool: { enabled: false },
        category: "",
        tags: []
    });

    const [sectionModal, setSectionModal] = useState<{
        open: boolean;
        mode: "add" | "edit";
        section?: SectionWithQuestions;
        index?: number;
    }>({
        open: false,
        mode: "add"
    });

    // --- effects ---
    useEffect(() => {
        // Rely on <RequireAdmin> for access control.
        // Only fetch once user is known.
        if (!user) return;
        fetchTemplates();
        fetchSectionTypes();
    }, [user]);

    useEffect(() => {
        if (testData.skills.length > 0) fetchQuestions();
    }, [testData.skills]);

    useEffect(() => {
        let filtered = questions;
        if (searchTerm) {
            filtered = filtered.filter(
                (q) =>
                    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterType) filtered = filtered.filter((q) => q.type === filterType);
        if (filterDifficulty)
            filtered = filtered.filter((q) => q.difficulty === filterDifficulty);

        setFilteredQuestions(filtered);
    }, [questions, searchTerm, filterType, filterDifficulty]);

    // --- fetchers ---
    const fetchTemplates = async () => {
        try {
            const res = await testAPI.getTestTemplates();
            setTemplates(res.templates);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchSectionTypes = async () => {
        try {
            const res = await testAPI.getSectionTypes();
            setSectionTypes(res.sectionTypes);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            testData.skills.forEach((skill) => params.append("skill", skill));
            params.append("status", "active");
            params.append("limit", "200");
            const res = await questionAPI.getAllQuestions(params.toString());
            setQuestions(res.questions);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- handlers ---
    const handleCreateTest = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!testData.title || !testData.description || testData.skills.length === 0) {
                throw new Error("Please fill in all required fields");
            }

            const hasQuestions =
                testData.questions.length > 0 ||
                newQuestions.length > 0 ||
                testData.sections.length > 0;

            if (!hasQuestions) {
                throw new Error("Please add questions or sections before saving.");
            }

            // create new questions first
            const createdIds: string[] = [];
            for (const nq of newQuestions) {
                try {
                    const res = await questionAPI.createQuestion(nq);
                    createdIds.push(res.question._id);
                } catch (err) {
                    console.warn("Failed to create question:", nq.title, err);
                }
            }

            const payload: CreateTestData = {
                ...testData,
                questions: testData.questions.map((q) => ({
                    ...q,
                    questionId: createdIds.includes(q.questionId)
                        ? createdIds[createdIds.indexOf(q.questionId)]
                        : q.questionId
                })),
                sections: testData.sections.map((s) => ({
                    ...s,
                    questions: s.questions.map((q) => ({
                        ...q,
                        questionId: createdIds.includes(q.questionId)
                            ? createdIds[createdIds.indexOf(q.questionId)]
                            : q.questionId
                    }))
                }))
            };

            const res = await testAPI.createTest(payload);
            navigate(`/admin/tests/${res.test._id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-4">
            {error && (
                <Alert color="danger" toggle={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Row>
                <Col lg="5" className="pe-lg-2">
                    <TestConfigPanel
                        templates={templates}
                        testData={testData}
                        setTestData={setTestData}
                        sectionTypes={sectionTypes}
                        onTemplateSelect={() => setActiveTab("sections")}
                        validationResult={validationResult}
                        onCreateTest={handleCreateTest}
                        loading={loading}
                        allQuestions={questions} // ✅ new prop
                    />
                </Col>

                <Col lg="7" className="ps-lg-2">
                    {activeTab === "browse" && (
                        <QuestionBrowser
                            questions={questions}
                            filteredQuestions={filteredQuestions}
                            loading={loading}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterType={filterType}
                            setFilterType={setFilterType}
                            filterDifficulty={filterDifficulty}
                            setFilterDifficulty={setFilterDifficulty}
                            selectedSectionId={selectedSectionId}
                            setSelectedSectionId={setSelectedSectionId}
                            testData={testData}
                        />
                    )}

                    {activeTab === "create" && (
                        <QuestionCreator
                            newQuestions={newQuestions}
                            setNewQuestions={setNewQuestions}
                            selectedSectionId={selectedSectionId}
                            setSelectedSectionId={setSelectedSectionId}
                            testData={testData}
                            setTestData={setTestData}
                            user={user}
                        />
                    )}

                    {activeTab === "sections" && (
                        <SectionManager
                            testData={testData}
                            setTestData={setTestData}
                            sectionTypes={sectionTypes}
                            questions={questions}
                            setSectionModal={setSectionModal}
                            setValidationResult={setValidationResult}
                        />
                    )}
                </Col>
            </Row>

            <SectionModal
                sectionModal={sectionModal}
                setSectionModal={setSectionModal}
                sectionTypes={sectionTypes}
                onSave={(section) => {
                    const idx = testData.sections.findIndex((s) => s.order === section.order);
                    const updated = [...testData.sections];
                    if (idx >= 0) updated[idx] = section;
                    else updated.push(section);
                    setTestData({ ...testData, sections: updated });
                }}
            />
        </Container>
    );
};

export default CreateTestPage;
