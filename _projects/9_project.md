---
layout: page
title: Agentic Job Finder
description: A multi-agent resume-tailoring platform with validation agents that catch unsupported claims
img: assets/img/github_logo.png
importance: 0
category: work
---

An agentic resume-tailoring platform built with Python, CrewAI, and PostgreSQL.

Multiple agents draft and then validate each other's output, specifically to reduce hallucinated or
unsupported claims, the failure mode that makes LLM-written resumes untrustworthy. Prompt, model,
and tool settings live in YAML config so runs stay reproducible.
