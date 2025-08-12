// src/components/tests/SectionModal.tsx
import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

import type { SectionType, SectionWithQuestions } from "../../types/tests";

interface SectionModalState {
  open: boolean;
  mode: "add" | "edit";
  section?: SectionWithQuestions;
  index?: number;
}

interface SectionModalProps {
  sectionModal: SectionModalState;
  setSectionModal: React.Dispatch<React.SetStateAction<SectionModalState>>;
  sectionTypes: SectionType[];
  onSave: (section: SectionWithQuestions) => void;
}

const SectionModal: React.FC<SectionModalProps> = ({
  sectionModal,
  setSectionModal,
  sectionTypes,
  onSave,
}) => {
  const current = sectionModal.section;

  const close = () =>
    setSectionModal((prev) => ({
      ...prev,
      open: false,
    }));

  return (
    <Modal isOpen={sectionModal.open} toggle={close}>
      <ModalHeader toggle={close}>
        {sectionModal.mode === "add" ? "Add Section" : "Edit Section"}
      </ModalHeader>

      <ModalBody>
        <FormGroup>
          <Label htmlFor="sectionName">Section Name *</Label>
          <Input
            type="text"
            id="sectionName"
            value={current?.name || ""}
            onChange={(e) =>
              current && onSave({ ...current, name: e.target.value })
            }
            placeholder="Enter section name"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="sectionType">Section Type *</Label>
          <Input
            type="select"
            id="sectionType"
            value={current?.sectionType || "mixed"}
            onChange={(e) =>
              current &&
              onSave({
                ...current,
                sectionType: e.target.value as SectionWithQuestions["sectionType"],
              })
            }
          >
            {sectionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.name} ({t.suggestedTime} min)
              </option>
            ))}
          </Input>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="sectionTimeLimit">Time Limit (min)</Label>
          <Input
            type="number"
            id="sectionTimeLimit"
            value={current?.timeLimit ?? 15}
            onChange={(e) =>
              current &&
              onSave({
                ...current,
                timeLimit: Math.max(1, Number(e.target.value) || 15),
              })
            }
            min={1}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="sectionDescription">Description</Label>
          <Input
            type="textarea"
            id="sectionDescription"
            rows={3}
            value={current?.description || ""}
            onChange={(e) =>
              current && onSave({ ...current, description: e.target.value })
            }
            placeholder="Section description"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="sectionInstructions">Instructions</Label>
          <Input
            type="textarea"
            id="sectionInstructions"
            rows={3}
            value={current?.instructions || ""}
            onChange={(e) =>
              current && onSave({ ...current, instructions: e.target.value })
            }
            placeholder="Section instructions"
          />
        </FormGroup>

        <FormGroup check>
          <Label check>
            <Input
              type="checkbox"
              checked={Boolean(current?.questionPool?.enabled)}
              onChange={(e) =>
                current &&
                onSave({
                  ...current,
                  questionPool: {
                    ...current.questionPool,
                    enabled: e.target.checked,
                    totalQuestions: e.target.checked
                      ? current.questionPool?.totalQuestions || 5
                      : 0,
                  },
                })
              }
            />
            Use Question Pool
          </Label>
        </FormGroup>

        {current?.questionPool?.enabled && (
          <FormGroup className="mt-2">
            <Label htmlFor="totalQuestions">Total Questions in Pool</Label>
            <Input
              type="number"
              id="totalQuestions"
              value={current?.questionPool?.totalQuestions || 5}
              onChange={(e) =>
                current &&
                onSave({
                  ...current,
                  questionPool: {
                    ...current.questionPool,
                    totalQuestions: Math.max(1, Number(e.target.value) || 5),
                  },
                })
              }
              min={1}
            />
          </FormGroup>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          color="success"
          onClick={() => current && onSave(current)}
          disabled={!current}
        >
          Save
        </Button>
        <Button color="secondary" onClick={close}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SectionModal;
