package com.learningplatform.backend.features.onboarding.dto.request;

import java.util.List;

public class OnboardingRequestDto {
    private String qn1;
    private String ans1;
    private String qn2;
    private String ans2;
    private String qn3;
    private String ans3;
    private String qn4;
    private List<String> ans4;


    public String getQn1() {
        return qn1;
    }

    public void setQn1(String qn1) {
        this.qn1 = qn1;
    }

    public String getAns1() {
        return ans1;
    }

    public void setAns1(String ans1) {
        this.ans1 = ans1;
    }

    public String getQn2() {
        return qn2;
    }

    public void setQn2(String qn2) {
        this.qn2 = qn2;
    }

    public String getAns2() {
        return ans2;
    }

    public void setAns2(String ans2) {
        this.ans2 = ans2;
    }

    public String getQn3() {
        return qn3;
    }

    public void setQn3(String qn3) {
        this.qn3 = qn3;
    }

    public String getAns3() {
        return ans3;
    }

    public void setAns3(String ans3) {
        this.ans3 = ans3;
    }

    public String getQn4() {
        return qn4;
    }

    public void setQn4(String qn4) {
        this.qn4 = qn4;
    }

    public List<String> getAns4() {
        return ans4;
    }

    public void setAns4(List<String> ans4) {
        this.ans4 = ans4;
    }
}
