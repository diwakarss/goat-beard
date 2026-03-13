variable "project_name" {
  description = "Project name for resource naming"
  default     = "goat-beard"
}

variable "domain_name" {
  description = "Domain name for the site"
  default     = "goatbeards.jdlabs.top"
}

variable "aws_region" {
  description = "AWS region for resources"
  default     = "us-east-1"
}

variable "budget_limit" {
  description = "Monthly budget limit in USD"
  type        = number
  default     = 5
}

variable "budget_emails" {
  description = "List of email addresses to notify when budget is exceeded"
  type        = list(string)
  default     = ["nalan19ai@gmail.com"]
}
