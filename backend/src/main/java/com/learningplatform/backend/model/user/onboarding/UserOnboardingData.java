package com.learningplatform.backend.model.user.onboarding;

import com.learningplatform.backend.model.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany; // Changed from ElementCollection
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType; // For FetchType.LAZY

import java.util.ArrayList; // Good practice to initialize collection
import java.util.List;

@Entity
@Table(name = "user_onboarding_data")
public class UserOnboardingData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "onboarding_data_id")
    private Long onboardingDataId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private User user;

    @Column(name = "qn1")
    private String qn1;

    @Column(name = "ans1")
    private String ans1;

    @Column(name = "qn2")
    private String qn2;

    @Column(name = "ans2")
    private String ans2;

    @Column(name = "qn3")
    private String qn3;

    @Column(name = "ans3")
    private String ans3;

    @Column(name = "qn4")
    private String qn4;

    // --- MODIFICATION START ---
    @OneToMany(mappedBy = "userOnboardingData", // 'mappedBy' indicates the owning side is in UserOnboardingAns4
               cascade = CascadeType.ALL,      // Operations (persist, merge, remove) on UserOnboardingData
                                               // will cascade to associated UserOnboardingAns4 entries
               orphanRemoval = true,           // If an UserOnboardingAns4 is removed from the collection,
                                               // it will be deleted from the database
               fetch = FetchType.LAZY)         // Fetch answers only when explicitly accessed
    private List<UserOnboardingAns4> ans4 = new ArrayList<>(); // Initialize the list
    // --- MODIFICATION END ---

    // --- Constructors ---
    public UserOnboardingData() {}

    // UPDATED: Constructor now takes List<String> for ans4, converts to UserOnboardingAns4
    public UserOnboardingData(User user, String qn1, String ans1, String qn2, String ans2, String qn3, String ans3, String qn4, List<String> ans4Strings) {
        this.user = user;
        this.qn1 = qn1;
        this.ans1 = ans1;
        this.qn2 = qn2;
        this.ans2 = ans2;
        this.qn3 = qn3;
        this.ans3 = ans3;
        this.qn4 = qn4;
        // Convert List<String> to List<UserOnboardingAns4> entities
        if (ans4Strings != null) {
            for (String ans : ans4Strings) {
                this.addAns4(new UserOnboardingAns4(ans, this)); // Use the helper method to link
            }
        }
    }

    // --- Getters and Setters ---
    public Long getOnboardingDataId() { return onboardingDataId; }
    public void setOnboardingDataId(Long onboardingDataId) { this.onboardingDataId = onboardingDataId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getQn1() { return qn1; }
    public void setQn1(String qn1) { this.qn1 = qn1; }

    public String getAns1() { return ans1; }
    public void setAns1(String ans1) { this.ans1 = ans1; }

    public String getQn2() { return qn2; }
    public void setQn2(String qn2) { this.qn2 = qn2; }

    public String getAns2() { return ans2; }
    public void setAns2(String ans2) { this.ans2 = ans2; }

    public String getQn3() { return qn3; }
    public void setQn3(String qn3) { this.qn3 = qn3; }

    public String getAns3() { return ans3; }
    public void setAns3(String ans3) { this.ans3 = ans3; }

    public String getQn4() { return qn4; }
    public void setQn4(String qn4) { this.qn4 = qn4; }

    // --- MODIFICATION START (Ans4 Getters/Setters & Helper Methods) ---
    // Now returns a List of UserOnboardingAns4 entities
    public List<UserOnboardingAns4> getAns4() {
        return ans4;
    }

    // Setter for ans4: IMPORTANT to manage the bidirectional relationship
    public void setAns4(List<UserOnboardingAns4> ans4) {
        // Clear existing answers to avoid duplicates and correctly handle orphan removal
        this.ans4.clear();
        if (ans4 != null) {
            for (UserOnboardingAns4 answer : ans4) {
                this.addAns4(answer); // Use helper to ensure consistency
            }
        }
    }

    // Helper method to add an answer and set the bidirectional link
    public void addAns4(UserOnboardingAns4 answer) {
        this.ans4.add(answer);
        answer.setUserOnboardingData(this); // Set the back-reference
    }

    // Helper method to remove an answer and break the bidirectional link
    public void removeAns4(UserOnboardingAns4 answer) {
        this.ans4.remove(answer);
        answer.setUserOnboardingData(null); // Remove the back-reference
    }
    // --- MODIFICATION END ---
}