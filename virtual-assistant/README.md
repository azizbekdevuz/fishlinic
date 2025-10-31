# Smart aquaculture assistant - Veronica
### Introduct to you -Veronica. The best companion for fish and your aquarium. Veronica can help you to maintain the live for your fish. Help you to know your fish's health status and will alert to you if there are any problems with your aquarium 



Here is some steps which can help you to run Veronica on your local machine:

1. First, you need to set up the configuration by install the requirements packet: 
    
    #### For Mac user: ``` !pip -r install requirements.txt  ```

    #### For Windows user: ``` !pip -r install requirements_windows.txt  ```

    #### Some dependencies here are not support for Windows user, so I have to make a separated requirements.txt file 

2. Second, you need to signup for Pvporcurpine at https://picovoice.ai/ and then extract your Pvporcurpine API Key

3. In ```virtual_assistant\.env``` file, please put your Pvporcurpine API key in ```PVPORCURPINE_KEY```

4. In the ```audio``` file of this repository. If you are using Mac, please copy the path ```audio\Initiate-Veronica_en_mac_v3_0_0.ppn``` and for Windows user is ```audio\Initiate-Veronica_en_windows_v3_0_0.ppn``` then put it in ```KW_PATH``` in the ```.env``` file

5. Run ```python virtual_assistant\assistant.py``` 

6. Say ```Initiate Veronica``` then enjoy being Tony Stark !


---------------------------
To be continue ...
I will update after finishing the project
