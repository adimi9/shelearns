package com.learningplatform.backend.features.onboarding.service;

import com.learningplatform.backend.features.onboarding.client.FastApiClient;
import com.learningplatform.backend.features.onboarding.client.dto.request.FastApiRequestDto;
import com.learningplatform.backend.features.onboarding.client.dto.response.FastApiCourseDto;
import com.learningplatform.backend.features.onboarding.client.dto.response.FastApiResponseDto;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingResponseDto;
import com.learningplatform.backend.model.course.resources.Course;
import com.learningplatform.backend.model.course.resources.CourseLevel;
import com.learningplatform.backend.features.onboarding.dto.response.CourseResponseDto;
import com.learningplatform.backend.repository.course.resources.CourseRepository;
import com.learningplatform.backend.repository.course.resources.ResourceRepository;

import com.learningplatform.backend.model.course.resources.Resource;  

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


// logging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PersonalizationService {

    // dependencies 

    // - logger
    private static final Logger logger = LoggerFactory.getLogger(PersonalizationService.class);
    private final ResourceRepository resourceRepository;
    private final FastApiClient fastApiClient;

    // dependency injection w constructor 
    public PersonalizationService(ResourceRepository resourceRepository, FastApiClient fastApiClient) {
        this.resourceRepository = resourceRepository;
        this.fastApiClient = fastApiClient;

        logger.info("PersonalizationService initialized with ResourceRepository and FastApiClient.");
    
    }

    @Autowired
    private CourseRepository courseRepository;

    public OnboardingResponseDto getPersonalizedCourses(OnboardingRequestDto requestDto) {

        logger.info("Starting getPersonalizedCourses for request: {}", requestDto.toString());


        Map<String, Object> questionnaireMap = new HashMap<>();
        questionnaireMap.put(requestDto.getQn1(), requestDto.getAns1());
        questionnaireMap.put(requestDto.getQn2(), requestDto.getAns2());
        questionnaireMap.put(requestDto.getQn3(), requestDto.getAns3());
        questionnaireMap.put(requestDto.getQn4(), requestDto.getAns4());

        FastApiRequestDto fastApiRequest = new FastApiRequestDto(questionnaireMap);

        logger.info("Sending request to FastApi: {}", fastApiRequest.toString());

        FastApiResponseDto fastApiResponse = fastApiClient.getPersonalizedCourses(fastApiRequest);

        logger.info("Received response from FastApi. Intro Paragraph: '{}', Recommended Courses count: {}",
                fastApiResponse.getIntroParagraph(), fastApiResponse.getRecommendedCourses().size());

        List<CourseResponseDto> enrichedCourses = new ArrayList<>();

        // for logging purposes
        int coursesProcessed = 0; 
        int coursesSkipped = 0; 

        for (FastApiCourseDto fastCourse : fastApiResponse.getRecommendedCourses()) {
            String courseId = fastCourse.getId();

            logger.debug("Processing FastApi recommended course with ID: {}", courseId);

            CourseResponseDto enriched = new CourseResponseDto();
            enriched.setCourseId(courseId);
            enriched.setName(fastCourse.getName());
            enriched.setDescription(fastCourse.getDescription());

            logger.debug("Attempting to find course by ID: {} in CourseRepository.", courseId);

            Optional<Course> courseOptional = courseRepository.findById(courseId);
            
            if (courseOptional.isEmpty()) {
                logger.warn("Course with ID {} not found in database. Skipping enrichment for this course.", courseId); 
                coursesSkipped++; 
                continue; 
            }

            Course course = courseOptional.get(); 

            logger.debug("Found course '{}' with ID: {} in database.", course.getCourseName(), courseId);
            
            logger.debug("Searching for 'intermediate' level in course '{}'.", course.getCourseName());
            
            CourseLevel intermediateLevel = course.getLevels().stream()
                .filter(level -> level.getLevelName() == CourseLevel.LevelName.INTERMEDIATE)
                .findFirst()
                .orElse(null);

            if (intermediateLevel == null) {
                logger.warn("Intermediate level not found for course '{}' (ID: {}). Skipping enrichment.",
                        course.getCourseName(), courseId);
                coursesSkipped++;
                continue;
            };

            logger.debug("Intermediate level found for course '{}'. Level ID: {}", course.getCourseName(), intermediateLevel.getCourse().getCourseId());

            List<Resource> resources = intermediateLevel.getResources();
            
            logger.debug("Processing resources for intermediate level of course '{}'. Total resources: {}",
                    course.getCourseName(), resources.size());

            long numDocs = resources.stream()
                .filter(r -> r.getResourceType() == Resource.ResourceType.DOC)
                .count();
            long numNotes = resources.stream()
                .filter(r -> r.getResourceType() == Resource.ResourceType.NOTE)
                .count();
            long numVideos = resources.stream()
                .filter(r -> r.getResourceType() == Resource.ResourceType.VIDEO)
                .count();
            int totalXP = resources.stream()
                .mapToInt(Resource::getResourceXp)
                .sum();

            enriched.setNumDocs(numDocs);
            enriched.setNumNotes(numNotes);
            enriched.setNumVideos(numVideos);
            enriched.setTotalXP(totalXP);

            enrichedCourses.add(enriched);
            coursesProcessed++; 

            logger.debug("Successfully enriched course '{}' (ID: {}). Docs: {}, Notes: {}, Videos: {}, Total XP: {}",
                    enriched.getName(), enriched.getCourseId(), numDocs, numNotes, numVideos, totalXP);
        }

        logger.info("Finished processing recommended courses. {} courses enriched, {} courses skipped.",
                coursesProcessed, coursesSkipped);

        OnboardingResponseDto response = new OnboardingResponseDto();
        response.setIntroParagraph(fastApiResponse.getIntroParagraph());
        response.setCourses(enrichedCourses);

        logger.info("Returning OnboardingResponseDto with {} enriched courses.", enrichedCourses.size());

        return response;
    }

}
