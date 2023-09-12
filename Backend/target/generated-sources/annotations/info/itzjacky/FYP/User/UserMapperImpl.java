package info.itzjacky.FYP.User;

import info.itzjacky.FYP.Game.Game;
import info.itzjacky.FYP.Review.Review;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2023-09-09T13:15:30+0800",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.6 (Azul Systems, Inc.)"
)
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDto.UserDtoBuilder userDto = UserDto.builder();

        userDto.id( user.getId() );
        userDto.name( user.getName() );
        userDto.email( user.getEmail() );
        userDto.joinDate( user.getJoinDate() );
        userDto.lastActive( user.getLastActive() );
        userDto.numOfReviews( user.getNumOfReviews() );
        List<Role> list = user.getRole();
        if ( list != null ) {
            userDto.role( new ArrayList<Role>( list ) );
        }
        List<Game> list1 = user.getDevelopedGames();
        if ( list1 != null ) {
            userDto.developedGames( new ArrayList<Game>( list1 ) );
        }
        List<Review> list2 = user.getReviews();
        if ( list2 != null ) {
            userDto.reviews( new ArrayList<Review>( list2 ) );
        }

        return userDto.build();
    }

    @Override
    public User userDTOToUser(UserDto userDto) {
        if ( userDto == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( userDto.getId() );
        user.name( userDto.getName() );
        user.email( userDto.getEmail() );
        user.joinDate( userDto.getJoinDate() );
        user.lastActive( userDto.getLastActive() );
        user.numOfReviews( userDto.getNumOfReviews() );
        List<Role> list = userDto.getRole();
        if ( list != null ) {
            user.role( new ArrayList<Role>( list ) );
        }
        List<Game> list1 = userDto.getDevelopedGames();
        if ( list1 != null ) {
            user.developedGames( new ArrayList<Game>( list1 ) );
        }
        List<Review> list2 = userDto.getReviews();
        if ( list2 != null ) {
            user.reviews( new ArrayList<Review>( list2 ) );
        }

        return user.build();
    }
}
