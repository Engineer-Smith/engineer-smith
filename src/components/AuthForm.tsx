import React, { useState } from "react";
import { Card, CardBody, CardTitle, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";

interface AuthFormProps {
  title: string;
  onSubmit: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  onSubmit,
  loading,
  error,
  submitLabel = "Submit",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <Card className="border-0 shadow-sm w-100" style={{ maxWidth: "400px" }}>
      <CardBody>
        <CardTitle tag="h2" className="h4 mb-4 font-weight-bold text-center">
          {title}
        </CardTitle>
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="email" className="text-muted">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="form-control"
            />
          </FormGroup>
          <FormGroup>
            <Label for="password" className="text-muted">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="form-control"
            />
          </FormGroup>
          <Button
            type="submit"
            color="primary"
            disabled={loading}
            className="w-100"
            block
          >
            {loading ? "Loading..." : submitLabel}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AuthForm;