import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  computed,
  inject,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConsultationService,
  ChatMessage,
  ConsultationSummary,
} from '../../services/consultation.service';
import { interval, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <button
                (click)="goBack()"
                class="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 class="text-xl font-medium md:text-2xl text-blue-500">
                  Consultation #{{ consultationId() }}
                </h1>
                @if (consultation()) {
                  <p class="text-sm text-gray-600">
                    Created {{ formatDate(consultation().created_at) }}
                  </p>
                }
              </div>
            </div>
            @if (consultation()) {
              <span [class]="getStatusClass(consultation().status)">
                {{ consultation().status }}
              </span>
            }
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <svg
              class="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        }

        <!-- Error State -->
        @if (errorMessage() && !loading()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg
                class="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-1">
                <p class="text-sm text-red-700">{{ errorMessage() }}</p>
              </div>
              <button
                (click)="loadConsultation()"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        }

        @if (consultation() && !loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column - Chat -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <!-- Chat Header -->
                <div class="p-4 border-b bg-gray-50">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Conversation
                  </h3>
                </div>

                <!-- Chat Messages -->
                <div class="h-96 overflow-y-auto p-4 space-y-4" #chatContainer>
                  @for (message of chatMessages(); track message.id) {
                    <div
                      [class]="
                        message.sender === 'patient'
                          ? 'flex justify-end'
                          : 'flex justify-start'
                      "
                    >
                      <div
                        [class]="
                          message.sender === 'patient'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        "
                        class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                      >
                        <p class="text-sm">{{ message.message }}</p>
                        <p class="text-xs mt-1 opacity-75">
                          {{ formatTime(message.timestamp) }}
                        </p>
                      </div>
                    </div>
                  }
                  @if (chatMessages().length === 0) {
                    <div class="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  }
                </div>

                <!-- Chat Input -->
                <div class="p-4 border-t bg-gray-50">
                  <div class="flex space-x-3">
                    <input
                      type="text"
                      [(ngModel)]="newMessageText"
                      (keyup.enter)="sendMessage()"
                      placeholder="Type your message..."
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      (click)="sendMessage()"
                      [disabled]="(!newMessageText.trim() && selectedFiles().length === 0) || sendingMessage()"
                      class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      @if (sendingMessage()) {
                        <svg
                          class="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      } @else {
                        Send
                      }
                    </button>
                  </div>

                  <!-- File Upload -->
                  <div class="mt-3">
                    <input
                      type="file"
                      #fileInput
                      (change)="onFileSelected($event)"
                      class="hidden"
                    />
                    <button
                      (click)="fileInput.click()"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      Attach File
                    </button>

                    <!-- Selected Files -->
                    @if (selectedFiles().length > 0) {
                      <div class="mt-4 space-y-2">
                        @for (file of selectedFiles(); track file.name) {
                          <div
                            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div class="flex items-center">
                              <svg
                                class="w-5 h-5 text-gray-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span class="text-sm text-gray-700">{{
                                file.name
                              }}</span>
                              <span class="text-xs text-gray-500 ml-2"
                                >({{ formatFileSize(file.size) }})</span
                              >
                            </div>
                            <button
                              (click)="removeFile(file)"
                              class="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Details -->
            <div class="space-y-6">
              <!-- Consultation Details -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Details
                </h3>
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-700"
                      >Status:</span
                    >
                    <span
                      [class]="getStatusClass(consultation().status)"
                      class="ml-2"
                    >
                      {{ consultation().status }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700"
                      >Language:</span
                    >
                    <span class="text-sm text-gray-600 ml-2">{{
                      consultation().language?.toUpperCase()
                    }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700"
                      >Created:</span
                    >
                    <span class="text-sm text-gray-600 ml-2">{{
                      formatDateTime(consultation().created_at)
                    }}</span>
                  </div>
                  @if (
                    consultation().updated_at !== consultation().created_at
                  ) {
                    <div>
                      <span class="text-sm font-medium text-gray-700"
                        >Updated:</span
                      >
                      <span class="text-sm text-gray-600 ml-2">{{
                        formatDateTime(consultation().updated_at)
                      }}</span>
                    </div>
                  }
                </div>

                @if (consultation().transcript) {
                  <div class="mt-4 pt-4 border-t">
                    <span class="text-sm font-medium text-gray-700 block mb-2"
                      >Original Description:</span
                    >
                    <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {{ consultation().transcript }}
                    </p>
                  </div>
                }

                @if (consultation().audio_url) {
                  <div class="mt-4 pt-4 border-t">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700"
                        >Audio Recording:</span
                      >
                      <button
                        (click)="transcribeAudio()"
                        [disabled]="transcribing() || !consultation().audio_url"
                        class="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        @if (transcribing()) {
                          <svg
                            class="animate-spin h-3 w-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              class="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            ></circle>
                            <path
                              class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Transcribing...
                        } @else {
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          Transcribe Audio
                        }
                      </button>
                    </div>
                    <audio controls class="w-full">
                      <source
                        [src]="consultation().audio_url"
                        type="audio/webm"
                      />
                      Your browser does not support audio playback.
                    </audio>
                    @if (transcriptionError()) {
                      <div
                        class="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700"
                      >
                        {{ transcriptionError() }}
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- ==========================================
     <!-- ==========================================
     ADD THIS SECTION TO YOUR TEMPLATE
     Place it in the right column after "Details" section
     ========================================== -->

              <!-- AI Summary Section -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3
                    class="text-lg font-semibold text-gray-900 flex items-center gap-2"
                  >
                    <svg
                      class="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    AI Summary
                  </h3>
                  <button
                    (click)="generateSummary()"
                    [disabled]="loadingSummary() || chatMessages().length === 0"
                    class="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    @if (loadingSummary()) {
                      <svg
                        class="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    } @else {
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {{ summary() ? 'Regenerate' : 'Generate' }}
                    }
                  </button>
                </div>

                <!-- Error Message -->
                @if (summaryError()) {
                  <div
                    class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2"
                  >
                    <svg
                      class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p class="text-sm text-red-700">{{ summaryError() }}</p>
                  </div>
                }

                <!-- Summary Content -->
                @if (summary(); as summaryData) {
                  <div class="space-y-4">
                    <!-- Main Summary -->
                    <div class="bg-purple-50 rounded-lg p-4">
                      <h4
                        class="font-semibold text-purple-900 mb-2 flex items-center gap-2"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Summary
                      </h4>
                      <p
                        class="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                      >
                        {{ summaryData.summary }}
                      </p>
                    </div>

                    <!-- Key Points -->
                    @if (
                      summaryData.key_points &&
                      summaryData.key_points.length > 0
                    ) {
                      <div>
                        <h4
                          class="font-semibold text-gray-900 mb-2 flex items-center gap-2"
                        >
                          <svg
                            class="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                          </svg>
                          Key Points
                        </h4>
                        <ul class="space-y-2">
                          @for (point of summaryData.key_points; track $index) {
                            <li
                              class="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <svg
                                class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              <span>{{ point }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    }

                    <!-- Medical Entities -->
                    @if (summaryData.medical_entities) {
                      <div class="space-y-3">
                        <!-- Symptoms -->
                        @if (
                          summaryData.medical_entities.symptoms &&
                          summaryData.medical_entities.symptoms.length > 0
                        ) {
                          <div class="bg-blue-50 rounded-lg p-3">
                            <h5
                              class="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2"
                            >
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Symptoms Mentioned
                            </h5>
                            <div class="flex flex-wrap gap-1">
                              @for (
                                symptom of summaryData.medical_entities
                                  .symptoms;
                                track symptom
                              ) {
                                <span
                                  class="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {{ symptom }}
                                </span>
                              }
                            </div>
                          </div>
                        }

                        <!-- Diagnoses -->
                        @if (
                          summaryData.medical_entities.diagnoses &&
                          summaryData.medical_entities.diagnoses.length > 0
                        ) {
                          <div class="bg-green-50 rounded-lg p-3">
                            <h5
                              class="font-semibold text-green-900 text-sm mb-2 flex items-center gap-2"
                            >
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Diagnoses
                            </h5>
                            <div class="flex flex-wrap gap-1">
                              @for (
                                diagnosis of summaryData.medical_entities
                                  .diagnoses;
                                track diagnosis
                              ) {
                                <span
                                  class="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {{ diagnosis }}
                                </span>
                              }
                            </div>
                          </div>
                        }

                        <!-- Medications -->
                        @if (
                          summaryData.medical_entities.medications &&
                          summaryData.medical_entities.medications.length > 0
                        ) {
                          <div class="bg-orange-50 rounded-lg p-3">
                            <h5
                              class="font-semibold text-orange-900 text-sm mb-2 flex items-center gap-2"
                            >
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                />
                              </svg>
                              Medications
                            </h5>
                            <div class="flex flex-wrap gap-1">
                              @for (
                                medication of summaryData.medical_entities
                                  .medications;
                                track medication
                              ) {
                                <span
                                  class="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {{ medication }}
                                </span>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <!-- Sentiment Badge -->
                    <div
                      class="flex items-center justify-between pt-3 border-t"
                    >
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Sentiment:</span>
                        <span
                          [class]="
                            'text-xs px-2 py-1 rounded-full ' +
                            (summaryData.sentiment === 'positive'
                              ? 'bg-green-100 text-green-800'
                              : summaryData.sentiment === 'concerned'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800')
                          "
                        >
                          {{ summaryData.sentiment | titlecase }}
                        </span>
                      </div>
                      <span class="text-xs text-gray-500">
                        {{ formatDateTime(summaryData.generated_at) }}
                      </span>
                    </div>

                    <!-- Export Options -->
                    <div class="flex gap-2 pt-3 border-t">
                      <button
                        (click)="downloadSummary('pdf')"
                        class="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export PDF
                      </button>
                      <button
                        (click)="downloadSummary('txt')"
                        class="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export TXT
                      </button>
                    </div>
                  </div>
                } @else if (!loadingSummary()) {
                  <!-- Empty State -->
                  <div class="text-center py-8 text-gray-500">
                    <svg
                      class="w-12 h-12 mx-auto mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p class="text-sm font-medium">No summary generated yet</p>
                    <p class="text-xs mt-1">
                      Click "Generate" to create an AI-powered summary of this
                      consultation
                    </p>
                    @if (chatMessages().length === 0) {
                      <p class="text-xs text-orange-600 mt-2">
                        ⚠️ Start a conversation first
                      </p>
                    }
                  </div>
                } @else {
                  <!-- Loading State -->
                  <div class="text-center py-8">
                    <svg
                      class="animate-spin h-8 w-8 text-purple-600 mx-auto mb-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p class="text-sm text-gray-600">
                      Generating AI summary...
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      This may take a few seconds
                    </p>
                  </div>
                }
              </div>

              <!-- Uploaded Files -->
              @if (
                consultation().file_attachments &&
                consultation().file_attachments.length > 0
              ) {
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Files ({{ consultation().file_attachments.length }})
                  </h3>
                  <div class="space-y-3">
                    @for (
                      file of consultation().file_attachments;
                      track file.id
                    ) {
                      <div
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div class="flex items-center min-w-0 flex-1">
                          <svg
                            class="w-5 h-5 text-gray-500 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div class="min-w-0 flex-1">
                            <p
                              class="text-sm font-medium text-gray-900 truncate"
                            >
                              {{ file.filename }}
                            </p>
                            <p class="text-xs text-gray-500">
                              {{ formatFileSize(file.file_size) }}
                            </p>
                          </div>
                        </div>
                        <a
                          [href]="file.file_url"
                          target="_blank"
                          class="ml-3 text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                        >
                          <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Quick Actions -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div class="space-y-3">
                  <button
                    (click)="refreshConsultation()"
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                  <button
                    (click)="goBack()"
                    class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
        display: inline-block;
      }

      .status-pending {
        background-color: #fef3c7;
        color: #92400e;
      }

      .status-active,
      .status-in_progress {
        background-color: #dbeafe;
        color: #1e40af;
      }

      .status-completed {
        background-color: #d1fae5;
        color: #065f46;
      }

      .status-cancelled {
        background-color: #fee2e2;
        color: #991b1b;
      }
    `,
  ],
})
export class ConsultationDetailPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private consultationService = inject(ConsultationService);

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Signals
  consultationId = signal<number | null>(null);
  consultation = signal<any>(null);
  chatMessages = signal<ChatMessage[]>([]);
  sendingMessage = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  summary = signal<ConsultationSummary | null>(null);
  loadingSummary = signal(false);
  summaryError = signal('');
  selectedFiles = signal<File[]>([]);
  transcribing = signal(false);
  transcriptionError = signal('');

  // Regular property for two-way binding
  newMessageText = '';

  // Computed signals
  messageCount = computed(() => this.chatMessages().length);
  hasFiles = computed(() => {
    const cons = this.consultation();
    return cons?.file_attachments && cons.file_attachments.length > 0;
  });

  hasSummary = computed(() => this.summary() !== null);

  private destroy$ = new Subject<void>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.consultationId.set(+params['id']);
        this.loadConsultation();
        this.loadSummary(); // ADD THIS LINE
        this.startChatPolling();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/patient/consultations']);
  }

  loadConsultation() {
    const id = this.consultationId();
    if (!id) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.consultationService.getById(id).subscribe({
      next: (consultation) => {
        if (consultation) {
          this.consultation.set(consultation);
          this.loadChatMessages();
        } else {
          this.errorMessage.set('Consultation not found');
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(
          error?.error?.detail ||
            error?.message ||
            'Failed to load consultation',
        );
        console.error('Failed to load consultation:', error);
        this.loading.set(false);
      },
    });
  }

  loadChatMessages() {
    const id = this.consultationId();
    if (!id) return;

    this.consultationService.getChatMessages(id).subscribe({
      next: (messages) => {
        this.chatMessages.set(messages || []);
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Failed to load chat messages:', error);
        this.chatMessages.set([]);
      },
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim()) return;

    const id = this.consultationId();
    if (!id) return;

    this.sendingMessage.set(true);
    this.errorMessage.set('');

    this.consultationService
      .addChatMessage(id, {
        consultation_id: id,
        sender: 'patient',
        message: this.newMessageText.trim(),
        message_type: 'text',
      })
      .subscribe({
        next: (message) => {
          if (message) {
            this.newMessageText = '';
            this.loadChatMessages();
          }
          this.sendingMessage.set(false);
        },
        error: (error: any) => {
          this.errorMessage.set(
            error?.error?.detail || error?.message || 'Failed to send message',
          );
          console.error('Failed to send message:', error);
          this.sendingMessage.set(false);
        },
      });
  }

  /**
   * Load existing summary if available
   */
  loadSummary() {
    const id = this.consultationId();
    if (!id) return;

    this.consultationService.getSummary(id).subscribe({
      next: (summary) => {
        if (summary) {
          this.summary.set(summary);
        }
      },
      error: (error) => {
        // Silently fail if no summary exists yet
        console.log('No existing summary found');
      },
    });
  }

  /**
   * Generate new AI summary
   */
  generateSummary() {
    const id = this.consultationId();
    if (!id) return;

    // Check if there are messages to summarize
    if (this.chatMessages().length === 0) {
      this.summaryError.set(
        'No messages to summarize. Start a conversation first.',
      );
      return;
    }

    this.loadingSummary.set(true);
    this.summaryError.set('');

    this.consultationService.generateSummary(id).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadingSummary.set(false);
      },
      error: (error: any) => {
        this.summaryError.set(
          error?.error?.detail ||
            error?.message ||
            'Failed to generate summary. Please try again.',
        );
        console.error('Failed to generate summary:', error);
        this.loadingSummary.set(false);
      },
    });
  }

  /**
   * Transcribe audio for this consultation
   */
  transcribeAudio() {
    const id = this.consultationId();
    if (!id) return;

    const consultation = this.consultation();
    if (!consultation?.audio_url) {
      this.transcriptionError.set('No audio recording available for transcription');
      return;
    }

    this.transcribing.set(true);
    this.transcriptionError.set('');

    this.consultationService.transcribeConsultation(id).subscribe({
      next: (result) => {
        if (result.transcript) {
          // Reload consultation to get updated transcript
          this.loadConsultation();
        }
        this.transcribing.set(false);
      },
      error: (error: any) => {
        this.transcriptionError.set(
          error?.error?.detail ||
            error?.message ||
            'Failed to transcribe audio. Please try again.',
        );
        console.error('Failed to transcribe audio:', error);
        this.transcribing.set(false);
      },
    });
  }

  /**
   * Download summary in specified format
   */
  downloadSummary(format: 'pdf' | 'txt' = 'pdf') {
    const id = this.consultationId();
    if (!id) {
      return;
    }

    this.consultationService.exportSummary(id, format).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `consultation-${id}-summary.${format}`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.summaryError.set(
          error?.error?.detail ||
            'Failed to download summary. Please try again.',
        );
        console.error('Failed to download summary:', error);
      },
    });
  }

  /**
   * Refresh summary (regenerate)
   */
  refreshSummary() {
    this.generateSummary();
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    const file = files[0];
    const id = this.consultationId();
    if (!file || !id) return;

    this.selectedFiles.update((current) => [...current, ...files]);

    this.consultationService.uploadFile(id, file).subscribe({
      next: () => {
        this.loadConsultation();
        event.target.value = '';
      },
      error: (error: any) => {
        this.errorMessage.set(
          error?.error?.detail || error?.message || 'Failed to upload file',
        );
        console.error('Failed to upload file:', error);
      },
    });
  }

  removeFile(file: File) {
    this.selectedFiles.update((current) => current.filter((f) => f !== file));
  }

  private startChatPolling() {
    const id = this.consultationId();
    if (!id) return;

    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.consultationService.getChatMessages(id)),
      )
      .subscribe({
        next: (messages) => {
          if (messages && messages.length !== this.chatMessages().length) {
            this.chatMessages.set(messages);
            this.scrollToBottom();
          }
        },
        error: (error) => console.error('Chat polling error:', error),
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  refreshConsultation() {
    this.loadConsultation();
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatDateTime(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusClass(status: string): string {
    const baseClass = 'status-badge ';
    switch (status?.toLowerCase()) {
      case 'pending':
        return baseClass + 'status-pending';
      case 'active':
      case 'in_progress':
        return baseClass + 'status-active';
      case 'completed':
        return baseClass + 'status-completed';
      case 'cancelled':
        return baseClass + 'status-cancelled';
      default:
        return baseClass + 'status-pending';
    }
  }
}
