package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.GameGenre;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public enum Gender {
    MALE(0),
    FEMALE(1),

    OTHER(2),

    UNDISCLOSED(3);

    private int id;

    Gender(int id){
        this.id = id;
    }

    public int getID(){
        return id;
    }

    public static List<Map<String, Integer>> getAllGenders() {
        ArrayList<Map<String, Integer>> returnedList = new ArrayList<Map<String, Integer>>();
        for (Gender g : Gender.values()) {
            Map <String, Integer> tmp = new HashMap<>();
            tmp.put(g.toString(), g.getID());
            returnedList.add(tmp);
        }
        return returnedList;
    }

//    get the gender string from the id
public static String getById(Integer id) {
    for(Gender g : values()) {
        if(g.getID() == id) return g.toString();
    }
    return "N/A";
}


    //    write a function that takes a string to find any genre that contains the string, and remove any underscore in the enum and ignore case
    public static List<Gender> getGenreFromString(String gender) {
        ArrayList<Gender> returnedList = new ArrayList<Gender>();
        gender = gender.replace("_",  "");
        for (Gender g : Gender.values()) {
            if (g.toString().replace("_", "").toLowerCase().contains(gender.toLowerCase())) {
                returnedList.add(g);
            }
        }
        return returnedList.isEmpty() ? null : returnedList;
    }
}
